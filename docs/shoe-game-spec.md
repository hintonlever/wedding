# Shoe Game Voting — Build Spec

Wedding: Ben & Alina, 29 August 2026, Great Keppel Island.

## Concept

During the reception, Ben and Alina play the shoe game on stage: seated back-to-back, each holding one of their own thongs and one of their partner's. Tegan (celebrant/MC) reads a question, they each raise a thong to answer, then Tegan reveals what the guests guessed.

Guests submit their guesses earlier in the day via a QR code printed on the menu. The QR points at a section on alinaandben.com, which links out to a Google Form.

## System overview

| Piece | What it does | Who builds it |
|---|---|---|
| Website section | Landing page for the QR. Explains the game, links to the form. | **This build** |
| Google Form | Collects guest guesses. | Manual (see below) |
| Google Sheet | Auto-collects responses, plus a summary tab with % per question. | Manual (see below) |
| Printed card | Josh handwrites the percentages onto a printed question list for Tegan. | Manual, on the day |

---

## 1. Website section — the build task

Add a new section to the existing single-file `index.html` on alinaandben.com.

**Requirements**

- Matches the existing site: coral/peach/sage palette, Cormorant Garamond headings, Jost body copy. Reuse the existing CSS variables — do not introduce new colours or fonts.
- Consistent with existing section structure and spacing. It should look like it was always there.
- Anchor id `#game` so the QR can point at `alinaandben.com/#game`.
- **Not linked from the site nav.** Reachable only via the direct anchor. Guests browsing the site before the day shouldn't stumble into it.
- Uses the same GSAP ScrollTrigger reveal pattern as the other sections, but must render correctly for a user landing directly on the anchor (i.e. content visible on load, not stuck at opacity 0 because the scroll trigger never fired).
- Mobile-first. Effectively every visitor arrives by scanning a QR code on a phone.
- Big tap target for the button — thumb-sized, not a text link.

**Content**

- Heading: *Think you know us?*
- Short paragraph: guests are guessing how Ben and Alina would answer, not giving their own opinion. Keep it to two sentences, warm and casual, matching the tone of the rest of the site.
- Button: "Take a guess" → links to the Google Form URL. Leave a clearly marked placeholder constant near the top of the section for the URL so it can be swapped in later.
- One line under the button noting responses close at the end of canapés.

**Explicitly out of scope**

Do not build a form, form handler, backend, or any submission logic into the page. The site is static on GitHub Pages and only ever renders — the Google Form owns all data collection. This is the same pattern as the existing RSVP section.

---

## 2. Google Form — manual setup

Build in Google Forms. Not part of the code build.

**Structure**

1. **Short answer, required — "Your name"**. Free text.
2. **20 multiple-choice questions**, two options each: `Ben` / `Alina`. All required.
3. **Long answer, optional — "Where will Ben and Alina be in five years?"** Free text.

**Settings**

- Sign-in **not** required and "collect email" **off** — guests must not hit a Google login wall.
- "Limit to one response" **off** — it forces sign-in. Duplicate voting isn't a real risk here.
- Confirmation message: something short and warm, plus a note that answers are revealed later in the night.

**Testing**

Open the live QR on a phone that has never seen the link and is not signed into Google. Complete a full submission end to end and confirm it lands in the Sheet.

---

## 3. Google Sheet — manual setup

Responses auto-populate a `Form Responses 1` tab. Add a second tab, `Summary`.

For each of the 20 questions, one row showing the split. With question 1's answers in column B of the responses tab:

```
=COUNTIF('Form Responses 1'!B:B, "Ben") / COUNTA('Form Responses 1'!B:B) - 1
```

Format as percentage, no decimals. Repeat across columns C through U for questions 2–20.

Layout the Summary tab as: question number | abbreviated question text | % Ben | % Alina. Josh reads down this column and transcribes.

Note: Google Forms also has a built-in summary view with percentage bars per question, which may be sufficient on its own. Build the Summary tab as the reliable version, but the Forms view is a fine fallback if anything goes wrong.

The five-year free-text answers need no calculation — Josh skims them and flags three or four good ones for Tegan to read at the end.

---

## 4. On the day — process

- QR goes live on the printed menus.
- Guests scan and submit during canapés.
- **Hard cutoff at the end of canapés.** Josh closes the form.
- Josh checks the counts, handwrites the percentages onto the pre-printed question sheet, flags the best five-year answers, and hands it to Tegan.
- Tegan reads from paper on stage. No phone, no screen.

**Printed sheet requirements** (prepare in advance, blank):

- A5 landscape, questions numbered 1–20, 14pt minimum.
- Wide blank gap on the right of each line for Josh to write the percentage.
- Space at the bottom for three or four five-year answers.
- 15 core questions, 5 marked as reserve so Tegan can cut or add live depending on how the room's going.

---

## Question list

To be written separately. Guidance for whoever drafts it:

- 20 total: 15 core, 5 reserve.
- Front-load questions where the guests are likely to guess **wrong** — the reveal is the punchline, and a run of correct guesses early flattens the mechanic.
- Middle stretch: habits, quirks, domestic stuff.
- Close on two sentimental ones (who fell first, who's more excited about today) so it ends warm rather than on a gag.
- A few Keppel-specific ones land well with guests who travelled — who was more stressed about the boat transfers, who packed more.
- Both families are in the room. Vet the final list with that in mind.
