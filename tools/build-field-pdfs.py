#!/usr/bin/env python3
"""Build the field worksheets from the same ES modules used by the website.

Requirements: Python with reportlab and pypdf; Node.js; Segoe UI or DejaVu Sans.
Run from any directory: python tools/build-field-pdfs.py [--node /path/to/node]
No pupil answers or identifying data are included in these blank worksheets.
"""
from __future__ import annotations

import argparse
import html
import json
import os
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
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "output" / "pdf"
PAGE_W, PAGE_H = A4
MARGIN = 16 * mm
WIDTH = PAGE_W - 2 * MARGIN
INK = colors.HexColor("#18252b")
MUTED = colors.HexColor("#455660")
LINE = colors.HexColor("#aab3b7")
PALE = colors.HexColor("#f3f5f5")


def register_fonts():
    candidates = [
        (Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts/segoeui.ttf",
         Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts/segoeuib.ttf"),
        (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
         Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")),
    ]
    for regular, bold in candidates:
        if regular.exists() and bold.exists():
            pdfmetrics.registerFont(TTFont("Worksheet", str(regular)))
            pdfmetrics.registerFont(TTFont("Worksheet-Bold", str(bold)))
            pdfmetrics.registerFontFamily("Worksheet", normal="Worksheet", bold="Worksheet-Bold")
            return
    raise SystemExit("Install Segoe UI or DejaVu Sans to preserve Sami and Spanish characters.")


def clean(value):
    return str(value).replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")


def esc(value):
    return html.escape(clean(value), quote=False)


def translated(value):
    if isinstance(value, str):
        return esc(value)
    if not value:
        return ""
    parts = [esc(value[key]) for key in ("es", "se", "nb", "text") if value.get(key)]
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


class WorksheetDoc(BaseDocTemplate):
    def __init__(self, path, pack, week):
        super().__init__(str(path), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
                         topMargin=20 * mm, bottomMargin=19 * mm,
                         title=f"Español - Semana {week} - GiellaStudio",
                         author="GiellaStudio", pageCompression=1)
        self.pack = pack
        self.week = week
        self.answer_page = None
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height,
                      id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="worksheet", frames=frame, onPageEnd=self.draw_frame))

    def draw_frame(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(MUTED)
        canvas.setFont("Worksheet-Bold", 8)
        canvas.drawString(MARGIN, PAGE_H - 11.5 * mm, "GIELLASTUDIO  /  ESPAÑOL")
        canvas.setFont("Worksheet", 8)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 11.5 * mm,
                               f"Vahkku {self.week} / Uke {self.week}")
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.4)
        canvas.line(MARGIN, PAGE_H - 15 * mm, PAGE_W - MARGIN, PAGE_H - 15 * mm)
        canvas.line(MARGIN, 13.5 * mm, PAGE_W - MARGIN, 13.5 * mm)
        canvas.setFont("Worksheet", 8)
        canvas.drawString(MARGIN, 9 * mm, "Bargobihtát / Oppgaveark" if not self.answer_page else "Dárkkis / Egenkontroll")
        canvas.drawRightString(PAGE_W - MARGIN, 9 * mm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if getattr(flowable, "is_answer_heading", False):
            self.answer_page = self.page


def table(rows, style_map, widths, headers=None, compact=False):
    data = []
    if headers:
        data.append([Paragraph(esc(value), style_map["thead"]) for value in headers])
    data.extend([[Paragraph(esc(value), style_map["table"]) for value in row] for row in rows])
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


def study_content(section, style_map):
    result = []
    if section.get("lessonText"):
        result.append(Paragraph(translated(section["lessonText"]), style_map["body"]))
    words = section.get("studyWords", [])
    if words:
        result.append(table([[w.get("es", ""), w.get("se", ""), w.get("nb", "")] for w in words],
                            style_map, [WIDTH * .35, WIDTH * .32, WIDTH * .33],
                            ["Español", "Davvisámegiella", "Bokmål"]))
        result.append(Spacer(1, 7))
    forms = section.get("studyForms")
    if forms:
        main_verb = section.get("verb") or next((q.get("verb") for q in section["questions"] if q.get("verb")), "")
        sets = [(main_verb, forms)]
        sets += [(item.get("verb", ""), item["forms"]) for item in section.get("additionalStudyForms", [])]
        if len(sets) == 2 and len(sets[0][1]) == len(sets[1][1]):
            rows = []
            for primary, extra in zip(sets[0][1], sets[1][1]):
                rows.append([primary[0], " + ".join(primary[1:]) + " = " + "".join(primary[1:]),
                             " + ".join(extra[1:]) + " = " + "".join(extra[1:])])
            result.append(table(rows, style_map, [WIDTH * .34, WIDTH * .33, WIDTH * .33],
                                ["Persovdna / Person", sets[0][0] or "Vearba / Verb", sets[1][0]]))
        else:
            for verb, form_rows in sets:
                result.append(table([[row[0], " + ".join(row[1:]), "".join(row[1:])] for row in form_rows],
                                    style_map, [WIDTH * .4, WIDTH * .3, WIDTH * .3],
                                    ["Persovdna / Person", verb or "Vearba / Verb", "Hápmi / Form"]))
        result.append(Spacer(1, 7))
    if section.get("dialogue"):
        for speaker, line in section["dialogue"]:
            result.append(Paragraph(f"<b>{esc(speaker)}:</b> {esc(line)}", style_map["body"]))
    return result


def question_prompt(question):
    if question.get("prompt"):
        return translated(question["prompt"]).replace("<br/>", " / ")
    before, after = question.get("before", ""), question.get("after", "")
    prompt = f"{esc(before)} <b>________________</b> {esc(after)}"
    if question.get("verb"):
        prompt += f" &nbsp; ({esc(question['verb'])})"
    return prompt


def question_card(question, code, style_map, keep=True):
    result = [Paragraph(f"<b>{code}.</b> {question_prompt(question)}", style_map["question"])]
    kind = question["type"]
    if kind == "choice":
        # Letters survive black-and-white copying and make the key unambiguous.
        options = [f"<b>{chr(65 + index)})</b> {esc(option)}" for index, option in enumerate(question["options"])]
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


def make_pdf(pack, week, style_map):
    destination = OUT / f"espanol-semana-{week}.pdf"
    doc = WorksheetDoc(destination, pack, week)
    story = [
        Paragraph(f"Español · Semana {week}", style_map["title"]),
        Paragraph(translated(pack.get("introTitle", {})), style_map["subtitle"]),
        Paragraph(translated(pack.get("plan", {})), style_map["body"]),
        Paragraph("<b>Vurke PDF:n / Lever i Teams</b><br/>"
                  "Čájet oahpaheaddjái. / Samle de utfylte oppgavesidene som én PDF med skann eller bilder, "
                  "og last den opp i oppgaven i Teams når du har nett. "
                  "På nettsiden kan du også fullføre oppgavene og lagre resultatrapporten som PDF.", style_map["small"]),
        Paragraph("<b>Dárkkis / Egenkontroll</b><br/>"
                  "Geahččal vuos. / Prøv selv først. Fasiten er bakerst. Rett med en annen farge, "
                  "og behold de første svarene så læreren ser hvordan du har arbeidet.", style_map["small"]),
        Spacer(1, 8),
    ]
    for section_index, section in enumerate(pack["sections"], 1):
        if section_index > 1:
            story.append(PageBreak())
        story += [Paragraph(esc(section["title"]), style_map["h1"]),
                  Paragraph(translated(section.get("instruction", {})), style_map["body"])]
        story += study_content(section, style_map)
        exercise_heading = [Paragraph("Hárjehala / Prøv selv", style_map["h2"])]
        piece_endings = next((q["pieces"]["endings"] for q in section["questions"] if q["type"] == "pieces"), None)
        if piece_endings:
            exercise_heading.append(Paragraph("<b>Geažus / Velg blant endelsene:</b> " + " · ".join(map(esc, piece_endings)), style_map["body"]))
        for question_index, question in enumerate(section["questions"], 1):
            if question_index == 1:
                story.append(KeepTogether(exercise_heading + question_card(question, f"{section_index}.{question_index}", style_map, keep=False)))
            else:
                story.append(question_card(question, f"{section_index}.{question_index}", style_map))
        story.append(Spacer(1, 5))
        story.append(KeepTogether([Paragraph("<b>Dárkkis / Etter økten:</b> Hva gikk fint? Hva vil du øve mer på?", style_map["small"]), AnswerLines(1)]))

    extra = pack.get("extra")
    if extra:
        story.append(PageBreak())
        story.append(Paragraph(esc(extra.get("title", "EXTRA")), style_map["h1"]))
        story.append(Paragraph(translated(extra.get("instruction", {})), style_map["body"]))
        if extra.get("model"):
            story.append(Paragraph("<b>Málle / Modell:</b> " + esc(extra["model"]), style_map["body"]))
        story.append(AnswerLines(7))
        story.append(Spacer(1, 12))
        story.append(Paragraph("Iešárvvoštallan / Egenvurdering", style_map["h2"]))
        story.append(Paragraph("Merk med kryss: <b>A</b> = Jeg klarer det selv, <b>B</b> = Jeg bruker modellen, "
                               "<b>C</b> = Jeg ønsker hjelp.", style_map["body"]))
        for section in pack["sections"]:
            story.append(Paragraph("A [ ] &nbsp; B [ ] &nbsp; C [ ] &nbsp; " + esc(section["title"]), style_map["body"]))
        story.append(Paragraph("Dette vil jeg spørre læreren om:", style_map["body"]))
        story.append(AnswerLines(2))

    story.append(PageBreak())
    heading = Paragraph("Dárkkis / Fasit", style_map["h1"])
    heading.is_answer_heading = True
    story.append(heading)
    story.append(Paragraph("<b>Geahččal vuos. / Prøv selv først.</b> Rett med en annen farge. "
                           "Hvis du måtte bruke fasiten, gjør oppgaven på nytt uten å se. "
                           "Frivillig skriving har ingen automatisk poengsum; læreren kan gi tilbakemelding.", style_map["body"]))
    for section_index, section in enumerate(pack["sections"], 1):
        if section_index == 3:
            story.append(PageBreak())
        rows = []
        for question_index, question in enumerate(section["questions"], 1):
            rows.append([f"{section_index}.{question_index}", answer_text(question)])
        story.append(KeepTogether([Paragraph(esc(section["title"]), style_map["h2"]),
                                  table(rows[:1], style_map, [WIDTH * .12, WIDTH * .88], compact=True)]))
        if len(rows) > 1:
            story.append(table(rows[1:], style_map, [WIDTH * .12, WIDTH * .88], compact=True))
        # The model tables already teach the full rule; a concise pointer is enough
        # here. Keeping individual feedback in the digital task avoids long keys.
        story.append(Spacer(1, 4))
        story.append(Paragraph("Hárjehala fas / Øv igjen: Bruk modellen og ordlisten i denne delen "
                               "til å forstå svarene før du prøver på nytt.", style_map["small"]))
    doc.build(story)
    reader = PdfReader(destination)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    expected = sum(len(s["questions"]) for s in pack["sections"])
    for si, section in enumerate(pack["sections"], 1):
        for qi, question in enumerate(section["questions"], 1):
            assert f"{si}.{qi}." in text, f"Missing exercise {si}.{qi}"
            for answer in question.get("answers", []):
                assert clean(answer) in text, f"Missing answer {answer!r}"
    assert "Fasit" in text and "Teams" in text
    assert "\ufffd" not in text and "\u25a0" not in text, "Replacement glyph in PDF text"
    return {"file": str(destination), "pages": len(reader.pages), "questions": expected,
            "answer_key_starts": doc.answer_page}


def load_pack(node, week):
    source = ROOT / "data" / f"espanol-semana-{week}.js"
    script = "import(process.argv[1]).then(m => process.stdout.write(JSON.stringify(m.default)))"
    raw = subprocess.check_output([node, "--input-type=module", "-e", script, source.as_uri()])
    return json.loads(raw.decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node", default=shutil.which("node"))
    args = parser.parse_args()
    if not args.node:
        raise SystemExit("Node.js was not found. Use --node /path/to/node.")
    register_fonts()
    OUT.mkdir(parents=True, exist_ok=True)
    result = [make_pdf(load_pack(args.node, week), week, styles()) for week in (1, 2)]
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
