#!/usr/bin/env python3
"""Build the Spanish topic worksheet from data/espanol-topics.js.

Install: python -m pip install reportlab pypdf
Run: python tools/build-topic-pdf.py
Optional: --node /path/to/node --font /path/to/regular.ttf --bold-font /path/to/bold.ttf
Use --output to build a review copy without replacing output/pdf/espanol-temas.pdf.
Segoe UI is preferred on Windows; DejaVu Sans is the automatic Linux fallback.
The same fonts and source data reproduce the approved page layout.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
from pathlib import Path
import shutil
import subprocess

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Flowable, Frame, KeepTogether,
    PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
PAGE_W, PAGE_H = A4
MARGIN = 16 * mm
WIDTH = PAGE_W - 2 * MARGIN
ACCENT = colors.HexColor("#c94716")
RED = colors.HexColor("#ae2634")
INK = colors.HexColor("#382b26")
MUTED = colors.HexColor("#455660")
PALE = colors.HexColor("#fff1e9")
LINE = colors.HexColor("#c6b6ae")
PRONOUNS = {"yo", "tú", "él", "ella", "nosotros", "nosotras", "vosotros", "vosotras", "ellos", "ellas"}
FORM_ENDINGS = {}


class Rich(str):
    """Markup constructed by this renderer, never raw source HTML."""


def red(value):
    return f'<font color="#ae2634"><b>{esc(value)}</b></font>'


def rich(value, verbs=True):
    if isinstance(value, Rich):
        return str(value)
    text = clean(value)
    parts, previous = [], 0
    for token in re.finditer(r"\b[\wÁÉÍÓÚÜÑáéíóúüñ]+\b", text):
        parts.append(esc(text[previous:token.start()]))
        word = token.group()
        if word.lower() in PRONOUNS:
            parts.append(red(word))
        elif verbs and word.lower() in FORM_ENDINGS:
            ending = FORM_ENDINGS[word.lower()]
            parts.append(esc(word[:-len(ending)]) + red(word[-len(ending):]))
        else:
            parts.append(esc(word))
        previous = token.end()
    parts.append(esc(text[previous:]))
    return "".join(parts)


def instruction_block(value, style_map):
    text = " &nbsp; · &nbsp; ".join(f'<b>{language.upper()}</b> {rich(value[language], verbs=False) if language == "es" else esc(value[language])}'
                          for language in ("es", "se", "nb") if value.get(language))
    return Paragraph(text, style_map["small"])


def instruction_key(question):
    return "writeVerb" if question["type"] == "write" and question.get("verb") else question["type"]


def register_fonts(regular_path=None, bold_path=None):
    candidates = [
        (Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts/segoeui.ttf",
         Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts/segoeuib.ttf"),
        (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
         Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")),
    ]
    if regular_path and bold_path:
        candidates = [(Path(regular_path), Path(bold_path))]
    for regular, bold in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("Worksheet", str(regular)))
            pdfmetrics.registerFont(TTFont("Worksheet-Bold", str(bold)))
            pdfmetrics.registerFontFamily("Worksheet", normal="Worksheet", bold="Worksheet-Bold")
            return
    raise SystemExit("Font files not found. Install Segoe UI or DejaVu Sans, or pass --font and --bold-font with Unicode TrueType fonts.")


def clean(value):
    return str(value).replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")


def esc(value):
    return html.escape(clean(value), quote=False)


def translated(value):
    if isinstance(value, str):
        return rich(value)
    if not value:
        return ""
    parts = [rich(value[key]) if key in ("es", "text") else esc(value[key]) for key in ("es", "se", "nb", "text") if value.get(key)]
    return "<br/>".join(dict.fromkeys(parts))


def styles():
    base = dict(fontName="Worksheet", textColor=INK, alignment=TA_LEFT)
    return {
        "title": ParagraphStyle("title", fontSize=23, leading=28, spaceAfter=7, **base),
        "subtitle": ParagraphStyle("subtitle", fontSize=11, leading=15, spaceAfter=8, **base),
        "h1": ParagraphStyle("h1", fontSize=15, leading=19, spaceAfter=7, fontName="Worksheet-Bold", textColor=INK),
        "h2": ParagraphStyle("h2", fontSize=11, leading=15, spaceBefore=7, spaceAfter=5, fontName="Worksheet-Bold", textColor=INK),
        "body": ParagraphStyle("body", fontSize=10, leading=14, spaceAfter=5, **base),
        "small": ParagraphStyle("small", fontSize=8.6, leading=11.5, spaceAfter=4, **base),
        "tiny": ParagraphStyle("tiny", fontSize=8, leading=10.5, spaceAfter=2, **base),
        "question": ParagraphStyle("question", fontSize=10.6, leading=14.5, spaceAfter=4, **base),
        "options": ParagraphStyle("options", fontSize=10, leading=14.5, spaceAfter=0, **base),
        "table": ParagraphStyle("table", fontSize=9, leading=12, **base),
        "thead": ParagraphStyle("thead", fontSize=8.7, leading=11.5, fontName="Worksheet-Bold", textColor=INK),
    }


class AnswerLines(Flowable):
    def __init__(self, count=1, spacing=7 * mm):
        super().__init__()
        self.count = count
        self.spacing = spacing
        self.height = count * spacing + 3

    def wrap(self, avail_width, avail_height):
        self.width = avail_width
        return self.width, self.height

    def draw(self):
        self.canv.setStrokeColor(LINE)
        self.canv.setLineWidth(0.4)
        for index in range(self.count):
            y = self.height - (index + 1) * self.spacing
            self.canv.line(0, y, self.width, y)


def table(rows, style_map, widths, headers=None, compact=False):
    data = []
    if headers:
        data.append([Paragraph(rich(value), style_map["thead"]) for value in headers])
    data.extend([[Paragraph(rich(value), style_map["table"]) for value in row] for row in rows])
    result = Table(data, colWidths=widths, hAlign="LEFT", repeatRows=1 if headers else 0)
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 2 if compact else 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 if compact else 3),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, LINE),
    ]
    if headers:
        commands += [("BACKGROUND", (0, 0), (-1, 0), PALE)]
    result.setStyle(TableStyle(commands))
    return result


def question_prompt(question):
    if question.get("context"):
        context = question["context"]
        person = context["person"][:1].upper() + context["person"][1:]
        after = context["after"]
        if after and after[-1] not in ".!?":
            after += "."
        return (f'{rich(person)} <b>____________________________</b> '
                f'{rich(after)} &nbsp; ({esc(question["verb"])})')
    if question.get("prompt"):
        return translated(question["prompt"]).replace("<br/>", " / ")
    before, after = question.get("before", ""), question.get("after", "")
    prompt = f"{rich(before)} <b>____________________________</b> {rich(after)}"
    if question.get("verb"):
        prompt += f" &nbsp; ({esc(question['verb'])})"
    return prompt


def question_card(question, code, style_map, keep=True):
    result = [Paragraph(f"<b>{code}.</b> {question_prompt(question)}", style_map["question"])]
    kind = question["type"]
    if kind == "choice":
        # Letters survive black-and-white copying and make the key unambiguous.
        options = [f"<b>{chr(65 + index)})</b> {rich(option)}" for index, option in enumerate(question["options"])]
        result.append(Paragraph(" &nbsp; &nbsp; ".join(options), style_map["options"]))
        result.append(Spacer(1, 7))
    elif kind == "pieces":
        pieces = question["pieces"]
        if pieces.get("fixedStem"):
            stem = pieces["fixedStem"]
            result.append(Paragraph(f"<b>{esc(stem)} + __________ = ________________________</b>", style_map["body"]))
        else:
            result.append(Paragraph("Mátta / Stamme: " + " · ".join(map(esc, pieces.get("stems", []))), style_map["small"]))
            result.append(Paragraph("__________ + __________ = ________________________", style_map["body"]))
        result.append(Spacer(1, 5))
    else:
        result.append(AnswerLines(1) if question.get("prompt") else Spacer(1, 12))
        result.append(Spacer(1, 3))
    return KeepTogether(result) if keep else result


def answer_text(question):
    answers = question.get("answers", [])
    if question["type"] == "choice":
        values = []
        for answer in answers:
            index = question["options"].index(answer)
            values.append(f"{chr(65 + index)}) {answer}")
        return " / ".join(values)
    values = []
    for answer in answers:
        values.append(answer + " = " + answer.replace(" + ", "") if question["type"] == "pieces" else answer)
    return " / ".join(values)


def answer_markup(question):
    if question["type"] == "pieces":
        values = []
        for answer in question["answers"]:
            stem, ending = answer.split(" + ", 1)
            values.append(f'{esc(stem)} + {red(ending)} = {esc(stem)}{red(ending)}')
        return Rich(" / ".join(values))
    return Rich(rich(answer_text(question)))


class TopicDoc(BaseDocTemplate):
    def __init__(self, destination):
        super().__init__(str(destination), pagesize=A4,
                         leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=20*mm, bottomMargin=18*mm,
                         title="Español por temas - GiellaStudio", author="GiellaStudio")
        self.in_answers = False
        self.answer_page = None
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height,
                      id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="normal", frames=frame, onPageEnd=self.draw_frame))

    def draw_frame(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(ACCENT)
        canvas.rect(0, PAGE_H - 5*mm, PAGE_W, 5*mm, fill=1, stroke=0)
        canvas.setFont("Worksheet-Bold", 8.5)
        canvas.drawString(MARGIN, PAGE_H - 12*mm, "GIELLASTUDIO  /  ESPAÑOL")
        canvas.setFont("Worksheet", 8.5)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 12*mm,
                              "RESPUESTAS" if self.in_answers else "POR TEMAS")
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(.4)
        canvas.line(MARGIN, 13.5*mm, PAGE_W-MARGIN, 13.5*mm)
        canvas.setFillColor(MUTED)
        canvas.setFont("Worksheet", 8)
        canvas.drawString(MARGIN, 9*mm, "Respuestas" if self.in_answers else "Ejercicios")
        canvas.drawRightString(PAGE_W - MARGIN, 9*mm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if getattr(flowable, "is_answer_heading", False):
            self.in_answers = True
            self.answer_page = self.page


def read_data(node):
    source = ROOT / "data/espanol-topics.js"
    instructions = ROOT / "data/espanol-instructions.js"
    script = ("Promise.all(process.argv.slice(1).map(p=>import(p))).then(([m,i]) => "
              "process.stdout.write(JSON.stringify({topics:m.default||m.topics,instructions:i.instructions||i.default})))")
    return json.loads(subprocess.check_output([node, "--input-type=module", "-e", script, source.as_uri(), instructions.as_uri()]).decode("utf-8"))


def spanish(value):
    if isinstance(value, str):
        return value
    return (value or {}).get("es", "")


def topic_support(topic, style_map):
    story = []
    forms = topic.get("studyForms")
    words = topic.get("studyWords", [])
    if forms:
        sets = [(topic.get("verb") or next((q.get("verb") for q in topic["questions"] if q.get("verb")), ""), forms)]
        sets += [(v["verb"], v["forms"]) for v in topic.get("additionalStudyForms", [])]
        if words:
            story.append(Paragraph(" · ".join(f"<b>{rich(w['es'])}</b> = {esc(w['se'])} / {esc(w['nb'])}" for w in words), style_map["small"]))
        if len(sets) == 2:
            rows = [[Rich(rich(main[0])), Rich(f'{esc(main[1])} + {red(main[2])} = {esc(main[1])}{red(main[2])}'),
                     Rich(f'{esc(second[1])} + {red(second[2])} = {esc(second[1])}{red(second[2])}')]
                    for main, second in zip(sets[0][1], sets[1][1])]
            story.append(table(rows, style_map, [WIDTH*.32, WIDTH*.34, WIDTH*.34],
                                    ["Pronombre", sets[0][0], sets[1][0]]))
        else:
            story.append(table([[Rich(rich(p)), Rich(f"{esc(s)} + {red(e)}"), Rich(esc(s)+red(e))] for p,s,e in forms], style_map,
                                    [WIDTH*.4, WIDTH*.3, WIDTH*.3], ["Pronombre", "Raíz + terminación", "Verbo"]))
    elif words:
        story.append(table([[w.get("es", ""), w.get("se", ""), w.get("nb", "")] for w in words], style_map,
                                [WIDTH*.34, WIDTH*.32, WIDTH*.34],
                                ["Español", "Davvisámegiella", "Bokmål"], compact=topic["title"] == "Palabras"))
    return story


def build(topics, instructions, destination, font=None, bold_font=None):
    register_fonts(font, bold_font)
    FORM_ENDINGS.clear()
    group_endings = {}
    for topic in topics:
        sets = [topic.get("studyForms") or []] + [v["forms"] for v in topic.get("additionalStudyForms", [])]
        for forms in sets:
            for person, stem, ending in forms:
                FORM_ENDINGS[(stem + ending).lower()] = ending
        if topic.get("studyForms") and topic.get("studyWords"):
            group_endings[topic["studyWords"][0].get("verbGroup")] = [row[2] for row in topic["studyForms"]]
    for topic in topics:
        for word in topic.get("studyWords", []):
            if word.get("regularity") == "Regular" and word.get("verbGroup") in group_endings:
                for ending in group_endings[word["verbGroup"]]:
                    FORM_ENDINGS[word["es"][:-2] + ending] = ending
    destination.parent.mkdir(parents=True, exist_ok=True)
    st = styles()
    st["h1"].textColor = ACCENT
    st["h1"].fontSize = 18
    st["h1"].leading = 22
    st["h2"].textColor = RED
    doc = TopicDoc(destination)
    story = []
    for ti, topic in enumerate(topics, 1):
        if ti > 1:
            story.append(PageBreak())
        story.append(Paragraph(f"{ti} · {esc(topic['title'])}", st["h1"]))
        lesson = spanish(topic.get("lessonText"))
        if lesson:
            story.append(Paragraph(rich(lesson, verbs=False), st["small"]))
        story += topic_support(topic, st)
        exercise_heading = [Paragraph("Practica", st["h2"])]
        endings = next((q["pieces"]["endings"] for q in topic["questions"] if q["type"] == "pieces"), None)
        if endings:
            exercise_heading.append(Paragraph("<b>Terminaciones:</b> " + " · ".join(map(red, endings)), st["body"]))
        previous_kind = None
        for qi, question in enumerate(topic["questions"], 1):
            key = instruction_key(question)
            start = exercise_heading if qi == 1 else []
            if key != previous_kind:
                start = start + [instruction_block(instructions[key], st)]
            previous_kind = key
            if topic["title"] == "Palabras" and question["type"] == "write":
                story.extend(start)
                remaining = list(enumerate(topic["questions"][qi-1:], qi))
                rows = []
                for start in range(0, len(remaining), 2):
                    row = [question_card(q, f"{ti}.{number}", st, keep=False) for number, q in remaining[start:start+2]]
                    rows.append(row + ([""] if len(row) == 1 else []))
                columns = Table(rows, colWidths=[WIDTH/2]*2, hAlign="LEFT")
                columns.setStyle(TableStyle([
                    ("VALIGN",(0,0),(-1,-1),"TOP"),
                    ("LEFTPADDING",(0,0),(-1,-1),0),
                    ("RIGHTPADDING",(0,0),(-1,-1),12),
                    ("TOPPADDING",(0,0),(-1,-1),2),
                    ("BOTTOMPADDING",(0,0),(-1,-1),2),
                ]))
                story.append(columns)
                break
            if start:
                story.append(KeepTogether(start + question_card(question, f"{ti}.{qi}", st, keep=False)))
            else:
                story.append(question_card(question, f"{ti}.{qi}", st))

    story.append(PageBreak())
    heading = Paragraph("Respuestas", st["h1"])
    heading.is_answer_heading = True
    story += [heading, Paragraph("Primero intenta responder. Después corrige con otro color.", st["body"])]
    for ti, topic in enumerate(topics, 1):
        rows = [[f"{ti}.{qi}", answer_markup(q), Rich(rich(q["example"]))] for qi, q in enumerate(topic["questions"], 1)]
        key_table = table(rows, st, [WIDTH*.10, WIDTH*.43, WIDTH*.47],
                          ["", "Respuesta", "Ejemplo"], compact=True)
        title = Paragraph(f"{ti} · {esc(topic['title'])}", st["h2"])
        title.keepWithNext = True
        story += [title, key_table, Spacer(1, 5)]
    doc.build(story)
    reader = PdfReader(destination)
    text = "\n".join(p.extract_text() or "" for p in reader.pages)
    normal_text = " ".join(text.split())
    for ti, topic in enumerate(topics, 1):
        for qi, q in enumerate(topic["questions"], 1):
            assert f"{ti}.{qi}." in text
            for answer in q["answers"]:
                assert " ".join(clean(answer).split()) in normal_text, answer
            assert " ".join(clean(q["example"]).split()) in normal_text, q["example"]
    assert "Estoy OK" in text
    for forbidden in ["Semana", "semana", "Vahkku", "Uke", "15-20", "Iešárvvoštallan"]:
        assert forbidden not in text, forbidden
    assert "\ufffd" not in text and "\u25a0" not in text
    return {"file": str(destination), "pages": len(reader.pages), "questions":sum(len(t["questions"]) for t in topics),
            "answer_key_starts":doc.answer_page}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node", default=shutil.which("node"), help="Node.js executable (defaults to PATH).")
    parser.add_argument("--font", type=Path, help="Regular Unicode TrueType font.")
    parser.add_argument("--bold-font", type=Path, help="Bold Unicode TrueType font.")
    parser.add_argument("--output", type=Path, default=ROOT / "output/pdf/espanol-temas.pdf",
                        help="Output PDF (defaults to the repository's topic worksheet).")
    args = parser.parse_args()
    if not args.node:
        parser.error("Node.js was not found. Install Node.js or pass --node /path/to/node.")
    if bool(args.font) != bool(args.bold_font):
        parser.error("Pass both --font and --bold-font, or neither.")
    module = read_data(args.node)
    data = module.get("default") or module.get("topics")
    if isinstance(data, dict):
        topics = data.get("sections") or list(data.values())
    else:
        topics = data
    if not topics:
        raise ValueError("No topic data in espanol-topics.js")
    merged = []
    for topic in topics:
        sections = topic["sections"]
        words = {word["es"]: word for section in sections for word in section.get("studyWords", [])}
        merged.append({
            "title":topic["title"],
            "questions":[q for section in sections for q in section["questions"]],
            "instruction":{"es":" ".join(dict.fromkeys(spanish(s.get("instruction")) for s in sections))},
            "lessonText":{"es":" ".join(dict.fromkeys(spanish(s.get("lessonText")) for s in sections))},
            "studyWords":list(words.values()),
            "studyForms":sections[0].get("studyForms"),
            "additionalStudyForms":[{"verb":s["questions"][0]["verb"], "forms":s["studyForms"]} for s in sections[1:] if s.get("studyForms")],
        })
    print(json.dumps(build(merged, module["instructions"], args.output.resolve(), args.font, args.bold_font), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
