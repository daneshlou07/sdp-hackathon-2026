import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Executive Color Palette (Clean, high-contrast, professional)
    SDP_RED = RGBColor(215, 25, 32)         # Sime Darby Red
    EMERALD = RGBColor(5, 150, 105)         # Green Accent
    NAVY_DARK = RGBColor(15, 23, 42)        # Deep Navy / Slate 900
    NAVY_SURFACE = RGBColor(30, 41, 59)     # Slate 800
    TEXT_MUTED = RGBColor(100, 116, 139)    # Slate 500
    TEXT_BODY = RGBColor(51, 65, 85)        # Slate 700
    TEXT_DARK = RGBColor(15, 23, 42)        # Slate 900
    CARD_BG = RGBColor(255, 255, 255)       # Pure White
    CARD_BORDER = RGBColor(226, 232, 240)   # Light Slate Border
    BG_LIGHT = RGBColor(248, 250, 252)      # Canvas Light
    BG_DARK = RGBColor(11, 19, 21)          # Canvas Dark
    RED_TINT = RGBColor(254, 242, 242)
    GREEN_TINT = RGBColor(236, 253, 245)
    BLUE_TINT = RGBColor(239, 246, 255)
    BLUE_ACCENT = RGBColor(37, 99, 235)
    GOLD_ACCENT = RGBColor(217, 119, 6)
    WHITE = RGBColor(255, 255, 255)

    def set_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, category, title, subtitle=None, category_color=SDP_RED, dark=False):
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_right = tf_cat.margin_top = tf_cat.margin_bottom = 0
        p_c = tf_cat.paragraphs[0]
        p_c.text = category.upper()
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = category_color

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.733), Inches(0.55))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(24)
        p_t.font.bold = True
        p_t.font.color.rgb = WHITE if dark else TEXT_DARK

        # Subtitle
        if subtitle:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.733), Inches(0.35))
            tf_s = sub_box.text_frame
            tf_s.word_wrap = True
            tf_s.margin_left = tf_s.margin_right = tf_s.margin_top = tf_s.margin_bottom = 0
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle
            p_s.font.size = Pt(12)
            p_s.font.italic = True
            p_s.font.color.rgb = RGBColor(148, 163, 184) if dark else TEXT_MUTED

    def add_card(slide, left, top, width, height, title, items, tag=None, tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER, dark=False):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)

        tb = slide.shapes.add_textbox(Inches(left + 0.25), Inches(top + 0.2), Inches(width - 0.5), Inches(height - 0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        if tag:
            p0.text = f"[{tag.upper()}]  {title}"
            p0.font.bold = True
            p0.font.size = Pt(13)
            p0.font.color.rgb = tag_color
        else:
            p0.text = title
            p0.font.bold = True
            p0.font.size = Pt(14)
            p0.font.color.rgb = WHITE if dark else TEXT_DARK

        p_sp = tf.add_paragraph()
        p_sp.font.size = Pt(4)

        for item in items:
            p = tf.add_paragraph()
            p.font.size = Pt(10.5)
            p.font.color.rgb = RGBColor(203, 213, 225) if dark else TEXT_BODY
            p.line_spacing = 1.15
            if isinstance(item, tuple):
                lead, rest = item
                run1 = p.add_run()
                run1.text = f"- {lead}: "
                run1.font.bold = True
                run1.font.color.rgb = WHITE if dark else TEXT_DARK
                run2 = p.add_run()
                run2.text = rest
                run2.font.color.rgb = RGBColor(203, 213, 225) if dark else TEXT_BODY
            else:
                p.text = f"- {item}"

        return card

    def add_kpi_pill(slide, left, top, width, height, value, label, value_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER):
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        pill.fill.solid()
        pill.fill.fore_color.rgb = bg_color
        pill.line.color.rgb = border_color
        pill.line.width = Pt(1)

        tb = slide.shapes.add_textbox(Inches(left + 0.15), Inches(top + 0.1), Inches(width - 0.3), Inches(height - 0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

        p_v = tf.paragraphs[0]
        p_v.text = value
        p_v.font.size = Pt(18)
        p_v.font.bold = True
        p_v.font.color.rgb = value_color
        p_v.alignment = PP_ALIGN.CENTER

        p_l = tf.add_paragraph()
        p_l.text = label
        p_l.font.size = Pt(9.5)
        p_l.font.color.rgb = TEXT_MUTED
        p_l.alignment = PP_ALIGN.CENTER

    def set_speaker_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # ==========================================
    # SLIDE 1: Title & Executive Hook
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1, BG_DARK)

    # Banner
    h_box = s1.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.333), Inches(0.4))
    tf_h = h_box.text_frame
    p_h = tf_h.paragraphs[0]
    p_h.text = "SIME DARBY PROPERTY UNIVERSITY HACKATHON 2026  |  TRACK: PLANET"
    p_h.font.size = Pt(11)
    p_h.font.bold = True
    p_h.font.color.rgb = SDP_RED

    # Title
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.333), Inches(1.2))
    tf_t = t_box.text_frame
    p_t = tf_t.paragraphs[0]
    p_t.text = "GreenPulse"
    p_t.font.size = Pt(44)
    p_t.font.bold = True
    p_t.font.color.rgb = WHITE

    # Subtitle
    sub_box = s1.shapes.add_textbox(Inches(1.0), Inches(2.35), Inches(11.333), Inches(0.8))
    tf_sub = sub_box.text_frame
    tf_sub.word_wrap = True
    p_sub = tf_sub.paragraphs[0]
    p_sub.text = "Ditch the Diesel: Smart Battery Power for Construction Sites"
    p_sub.font.size = Pt(20)
    p_sub.font.color.rgb = EMERALD
    p_sub.font.bold = True

    p_sub2 = tf_sub.add_paragraph()
    p_sub2.text = "Stop throwing away RM 125,000 every month on rented diesel generators. We use batteries and smart software to power heavy site cranes cleanly and reliably."
    p_sub2.font.size = Pt(13)
    p_sub2.font.color.rgb = RGBColor(203, 213, 225)

    # 3 Plain Cards
    c_w = 3.55
    c_gap = 0.34
    top_c = 3.55
    add_card(s1, 1.0, top_c, c_w, 2.3, "The Money Pit", [
        ("No Power Grid", "Sites wait 1 to 2 years for TNB cables, so they rely on rented generators."),
        ("No Diesel Subsidy", "Builders pay full price for commercial diesel at RM 5.17 per liter."),
        ("Huge Monthly Bill", "RM 70,000 for fuel + RM 30,000 generator rental = over RM 100,000 burned every month.")
    ], tag="Problem", tag_color=SDP_RED, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85), dark=True)

    add_card(s1, 1.0 + c_w + c_gap, top_c, c_w, 2.3, "The Smart Fix", [
        ("Solar + Battery", "We plug smart software into big battery containers and temporary solar panels."),
        ("Smooths Crane Surges", "When the crane lifts, the battery gives an instant boost in 4 milliseconds."),
        ("Zero Breaker Trips", "Keeps the power stable so concrete pours never stall mid-lift.")
    ], tag="Solution", tag_color=EMERALD, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85), dark=True)

    add_card(s1, 1.0 + (c_w + c_gap)*2, top_c, c_w, 2.3, "The Real Impact", [
        ("Big Cash Savings", "Saves RM 125,000 every month and pays for itself in just 14 months."),
        ("Quiet & Clean", "88% quieter (54 dB at the fence). Zero black smoke and zero neighbor complaints."),
        ("10-Year Use", "Move the batteries from Putra Heights to Elmina across future township phases.")
    ], tag="Result", tag_color=BLUE_ACCENT, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85), dark=True)

    # 4 KPI Pills
    pill_w = 2.65
    pill_gap = 0.24
    pill_top = 6.1
    add_kpi_pill(s1, 1.0, pill_top, pill_w, 0.95, "RM 125,000 / mo", "Cash Saved Per Site", value_color=EMERALD, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85))
    add_kpi_pill(s1, 1.0 + pill_w + pill_gap, pill_top, pill_w, 0.95, "14 Months", "Payback Time", value_color=WHITE, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85))
    add_kpi_pill(s1, 1.0 + (pill_w + pill_gap)*2, pill_top, pill_w, 0.95, "88% Quieter", "Boundary Noise (-28 dB)", value_color=BLUE_ACCENT, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85))
    add_kpi_pill(s1, 1.0 + (pill_w + pill_gap)*3, pill_top, pill_w, 0.95, "77% Carbon Cut", "Site Emissions Slashed", value_color=SDP_RED, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85))

    set_speaker_notes(s1, """SPEAKER NOTES [0:00 - 0:45]
Good morning, judges.
Every time Sime Darby starts a new township project—like Putra Heights or City of Elmina—the site has no electrical connection from TNB for the first 1 to 2 years.
Because construction cannot wait, contractors rent giant diesel generators.
Following diesel subsidy cuts, commercial diesel costs RM 5.17 per liter. A typical site burns RM 70,000 in fuel and spends another RM 30,000 to rent the generator every month. That is over RM 100,000 thrown away every month.
On top of that, noisy generators lead to angry neighbors and risk government stop-work fines.
We built GreenPulse to fix this. It is smart software that replaces rented generators with clean solar and battery storage. Let us walk you through how it works.""")

    # ==========================================
    # SLIDE 2: 1. Problem
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2, BG_LIGHT)
    add_header(s2, "The Story  |  1. Problem", "New Sites Waste Over RM 100,000 Every Month on Dirty Diesel",
               "Three real problems that happen on every new Sime Darby construction parcel")

    card_w = 3.64
    card_gap = 0.4
    card_top = 1.8
    card_h = 3.8

    add_card(s2, 0.8, card_top, card_w, card_h, "1. TNB Power Takes 1 to 2 Years", [
        ("No Grid Connection", "When building starts at greenfield areas, permanent TNB substations take 9 to 18 months to build and turn on."),
        ("Contractors Are Trapped", "Building work cannot stop or delay without heavy late-delivery penalties."),
        ("Forced onto Generators", "Every site is forced to run temporary diesel power for 12 to 24 months.")
    ], tag="Grid Delay", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s2, 0.8 + card_w + card_gap, card_top, card_w, card_h, "2. Commercial Diesel Costs RM 5.17 / L", [
        ("Zero Government Subsidy", "Construction sites get zero diesel subsidies from the government (no BUDI Madani)."),
        ("Heavy Fuel Burn", "A typical site burns 12,000 to 14,000 liters of commercial Euro 5 diesel every month."),
        ("RM 70,000 Monthly Bill", "That is over RM 70,000 in fuel invoices every month on a single site.")
    ], tag="Fuel Cost", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s2, 0.8 + (card_w + card_gap)*2, card_top, card_w, card_h, "3. Giant Rentals for Tiny Spikes", [
        ("RM 30,000 Rental Invoice", "Contractors pay RM 30,000 every month to rent huge 500 kVA generators."),
        ("The Crane Spike Trap", "Why so big? Because when a 50t tower crane starts lifting, it draws a quick 94 kW power surge. Smaller generators trip."),
        ("Idling 70% of the Day", "Most of the day, these giant generators just idle at 25% capacity, wasting fuel and blowing smoke.")
    ], tag="Rental Bleed", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    # Bottom Alert Card
    reg_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.8), Inches(11.733), Inches(1.3))
    reg_card.fill.solid()
    reg_card.fill.fore_color.rgb = RED_TINT
    reg_card.line.color.rgb = SDP_RED
    reg_card.line.width = Pt(1)

    tb_reg = s2.shapes.add_textbox(Inches(1.0), Inches(5.9), Inches(11.333), Inches(1.1))
    tf_reg = tb_reg.text_frame
    tf_reg.word_wrap = True
    tf_reg.margin_left = tf_reg.margin_right = tf_reg.margin_top = tf_reg.margin_bottom = 0
    p_r0 = tf_reg.paragraphs[0]
    p_r0.text = "THE REGULATORY HEADACHE: NOISE COMPLAINTS & STOP-WORK ORDERS"
    p_r0.font.bold = True
    p_r0.font.size = Pt(12)
    p_r0.font.color.rgb = SDP_RED

    p_r1 = tf_reg.add_paragraph()
    p_r1.text = "Diesel generators roar at 82 decibels day and night. When sites are next to completed homes, neighbors complain immediately. Under Department of Environment (DOE) rules, residential boundary noise cannot exceed 60 dB during the day or 45 dB at night. Exceeding this brings DOE compound fines and stop-work orders that halt construction."
    p_r1.font.size = Pt(10.5)
    p_r1.font.color.rgb = TEXT_BODY

    set_speaker_notes(s2, """SPEAKER NOTES [Problem]
Let us look at the plain numbers:
First, TNB power takes 9 to 18 months to connect. Builders cannot wait.
Second, commercial diesel costs RM 5.17 per liter with zero subsidies. Burning 14,000 liters costs over RM 70,000 every single month.
Third, contractors rent giant 500 kVA generators at RM 30,000 a month solely because a crane draws a momentary 94 kW surge when it lifts. That means the generator runs half-empty 70% of the day.
Together, that is RM 100,000+ thrown away every month. And the constant 82 dB roar risks stop-work fines from the Department of Environment.""")

    # ==========================================
    # SLIDE 3: 2. Target User
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3, BG_LIGHT)
    add_header(s3, "The Story  |  2. Target User", "Three People on Site Who Need This Problem Fixed",
               "Built specifically for the real people running daily site operations, environmental safety, and company finance")

    p_w = 3.64
    p_gap = 0.4
    p_top = 1.8
    p_h = 5.2

    add_card(s3, 0.8, p_top, p_w, p_h, "Site Engineer (M&E Manager)", [
        ("Who He Is", "The engineer on site making sure power runs smoothly."),
        ("What He Cares About", "Keeping tower cranes, material hoists, and water pumps running with zero downtime."),
        ("His Big Frustrations", "Generators breaking down, breakers tripping when the crane lifts, ordering diesel deliveries, and worrying about fuel theft."),
        ("How GreenPulse Helps", "Absorbs motor surges so breakers never trip, shows exact battery charge, and warns him hours before rain hits."),
        ("His Win", "Zero power trips, 100% crane uptime, and no fuel refilling hassles.")
    ], tag="Site Operations", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s3, 0.8 + p_w + p_gap, p_top, p_w, p_h, "Site Safety Officer (EO)", [
        ("Who She Is", "The officer responsible for environment, health, and government compliance."),
        ("What She Cares About", "Passing DOE site inspections and preventing neighbor complaints."),
        ("Her Big Frustrations", "Angry residents complaining about generator noise, black exhaust smoke, and wasting days writing manual monthly reports."),
        ("How GreenPulse Helps", "Shows real-time fence noise at 54 dB, proves zero smoke, and lets her download a certified DOE report in 1 click."),
        ("Her Win", "88% quieter site, zero DOE fines, and zero neighbor complaints.")
    ], tag="Safety & Compliance", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s3, 0.8 + (p_w + p_gap)*2, p_top, p_w, p_h, "Finance Director & Sime Darby HQ", [
        ("Who They Are", "The team managing township budgets and group sustainability goals."),
        ("What They Care About", "Cutting unnecessary project expenses and hitting Sime Darby's 2030 net-zero targets."),
        ("Their Big Frustrations", "Millions spent on rented equipment that leaves zero value behind, and messy contractor diesel receipts."),
        ("How GreenPulse Helps", "Tracks live cash savings against RM 5.17/L fuel, calculates verified carbon cuts, and moves batteries across township phases for 10 years."),
        ("Their Win", "Saves RM 125,000/mo, 14-month payback, and real ESG data.")
    ], tag="Management & Finance", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s3, """SPEAKER NOTES [Target Users]
Software only works when it solves real problems for real people on site:
1. The Site Engineer: He does not care about buzzwords. He wants to know if the crane breaker will trip while hoisting wet concrete. GreenPulse makes sure it never trips.
2. The Safety Officer: She is caught between angry neighbors and government inspectors. GreenPulse keeps the site at 54 decibels and gives her 1-click audit reports.
3. The Finance Director at Sime Darby HQ: He wants to stop bleeding cash on rented generators and wants an asset that can be reused across township phases for 10 years.""")

    # ==========================================
    # SLIDE 4: 3. Solution
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4, BG_LIGHT)
    add_header(s4, "The Story  |  3. Solution", "GreenPulse: Smart Software That Replaces Diesel Generators",
               "We do not build hardware—we provide the smart software that runs clean battery containers on construction sites")

    # Left Container
    add_card(s4, 0.8, 1.8, 4.0, 5.2, "How the Software Works", [
        ("Smart Brain, Not Hardware", "We do not manufacture batteries. We build the smart operating system that controls them."),
        ("Works with Existing Containers", "Plugs directly into standard battery containers (like MegaBatt 261 kWh) and temporary solar panels."),
        ("No Guesswork on Site", "Our software monitors power second-by-second and tells the battery exactly when to charge and discharge."),
        ("Always Works Offline", "If mobile data goes down, the local controller keeps running safely on site. Power never stops."),
        ("Easy Contract Clause", "Can be written straight into standard Sime Darby contractor tenders today.")
    ], tag="The Core System", tag_color=NAVY_DARK, bg_color=CARD_BG, border_color=CARD_BORDER)

    # Right Container: 3 Clear Screens
    surf_w = 7.333
    surf_h = 1.6
    surf_top = 1.8
    surf_gap = 0.2

    add_card(s4, 5.2, surf_top, surf_w, surf_h, "1. Site Engineer Screen (/me)", [
        ("Live Machine Power", "Shows power going to the tower crane (45 kW), hoists (28 kW), and offices (12 kW)."),
        ("Surge Protection", "Absorbs 94 kW motor startup kicks in 4 milliseconds so breakers never trip."),
        ("Rain Warning", "Checks weather radar and pre-charges the battery to 88% before storms hit.")
    ], tag="Engineer Screen", tag_color=EMERALD, bg_color=GREEN_TINT, border_color=EMERALD)

    add_card(s4, 5.2, surf_top + surf_h + surf_gap, surf_w, surf_h, "2. Environmental Officer Screen (/eo)", [
        ("Live Fence Sound Meter", "Shows live sound at 54 dB, safely below the government 60 dB daytime limit."),
        ("Zero Smoke Certified", "Proves zero black smoke and clean air compliance under Malaysian regulations."),
        ("1-Click PDF Report", "Generates ready-to-print official reports for Department of Environment visits.")
    ], tag="Safety Screen", tag_color=SDP_RED, bg_color=RED_TINT, border_color=SDP_RED)

    add_card(s4, 5.2, surf_top + (surf_h + surf_gap)*2, surf_w, surf_h, "3. Finance & HQ Screen (/hq)", [
        ("Live RM 5.17/L Fuel Ticker", "Shows live cash saved every day based on official Malaysian diesel prices."),
        ("Verified Carbon Cuts", "Calculates real carbon savings for Sime Darby's Bursa Malaysia ESG reports."),
        ("10-Year Moving Plan", "Tracks where battery containers should move next as township phases finish.")
    ], tag="Management Screen", tag_color=BLUE_ACCENT, bg_color=BLUE_TINT, border_color=BLUE_ACCENT)

    set_speaker_notes(s4, """SPEAKER NOTES [Solution]
GreenPulse is the brain that makes clean site energy work.
We do not build hardware. We provide the smart software that connects to standard battery containers—like the MegaBatt units Inta Bina already uses.
We give each user a simple, dedicated screen:
Screen 1 gives the Site Engineer full power control and stops crane breakers from tripping.
Screen 2 proves to the Safety Officer that fence noise is 54 decibels and lets her print audit reports in 1 click.
Screen 3 gives HQ Finance live cash savings numbers and verified carbon data for annual reports.""")

    # ==========================================
    # SLIDE 5: 4. Innovation
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5, BG_LIGHT)
    add_header(s5, "The Story  |  4. Innovation", "Why GreenPulse Is Smarter Than Simple Battery Apps",
               "Standard battery apps only show yesterday's charts. GreenPulse actively controls the site in real time.")

    g_w = 5.666
    g_h = 2.45
    g_top1 = 1.8
    g_top2 = 4.5
    g_left1 = 0.8
    g_left2 = 6.866

    add_card(s5, g_left1, g_top1, g_w, g_h, "1. Absorbs Heavy Crane Surges in Under 4ms", [
        ("The Problem", "When a 50t crane lifts a 2.5t concrete bucket, motor startup draws 94 kW instantly."),
        ("The Normal Failure", "Standard batteries or weak grid lines dip and trip the main circuit breaker."),
        ("Our Fix", "GreenPulse commands the battery in under 4 milliseconds, smoothing the surge so nothing trips.")
    ], tag="Instant Power Boost", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s5, g_left2, g_top1, g_w, g_h, "2. Predicts Rainstorms Before They Hit", [
        ("The Problem", "A heavy afternoon storm can drop solar power from 145 kW down to 20 kW in minutes."),
        ("Radar Connection", "GreenPulse connects to MET Malaysia Doppler radar to spot rain 3 hours ahead."),
        ("Smart Pre-Charge", "Automatically charges the battery to 88% in the morning so you never run out of juice.")
    ], tag="Weather Foresight", tag_color=GOLD_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s5, g_left1, g_top2, g_w, g_h, "3. Filters Out Road Traffic Noise", [
        ("The Problem", "Noisy dump trucks driving on public roads outside can trigger false 70 dB noise alarms."),
        ("Smart Separation", "Our audio software separates site machinery noise from passing highway traffic."),
        ("Legal Protection", "Proves to government officers that true site noise is only 54 dB, preventing false fines.")
    ], tag="Noise Filter AI", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s5, g_left2, g_top2, g_w, g_h, "4. 10-Year Township Reuse (Not a Stranded Cost)", [
        ("The Contractor Dilemma", "A contractor on a 2-year job cannot justify buying an expensive battery container."),
        ("The Sime Darby Moat", "Sime Darby masterplans entire townships for 10 to 15 years."),
        ("Sequential Moves", "GreenPulse tracks batteries moving from Putra Heights to Elmina over 10 years, saving RM 9.8M.")
    ], tag="Township Asset", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s5, """SPEAKER NOTES [Innovation]
Most battery apps are passive: they just show a green dot and yesterday's power graphs.
GreenPulse does four smart things:
First, when a heavy crane starts lifting, it delivers a power boost in under 4 milliseconds so breakers never trip.
Second, it checks weather radar and pre-charges the battery before afternoon rainstorms.
Third, it filters out passing highway trucks from fence noise meters, proving your site stayed under 60 decibels.
Fourth, it helps Sime Darby reuse battery containers across different project phases for 10 years instead of renting disposable gear.""")

    # ==========================================
    # SLIDE 6: 5. How it Works
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6, BG_LIGHT)
    add_header(s6, "The Proof  |  5. How it Works", "How Power Flows from the Sun to Heavy Site Machinery",
               "A simple 4-step loop that runs cleanly on site every day")

    pipe_w = 2.7
    pipe_gap = 0.31
    pipe_top = 1.8
    pipe_h = 5.2

    add_card(s6, 0.8, pipe_top, pipe_w, pipe_h, "Step 1: Capture Clean Power", [
        ("Solar & Battery", "Temporary solar panels on roofs or ground feed power into a battery storage container."),
        ("Small 4G Box", "A small industrial box connects to the battery and solar inverters on site."),
        ("Fence Sound Meter", "A sound meter on the site hoarding tracks noise levels every second.")
    ], tag="1. Telemetry", tag_color=NAVY_DARK, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s6, 0.8 + pipe_w + pipe_gap, pipe_top, pipe_w, pipe_h, "Step 2: Smart Brain Plans", [
        ("Checks Weather", "GreenPulse checks rain radar and plans out power for the next 24 hours."),
        ("Holds Reserve", "Pre-charges the battery before storms so high-priority concrete work never halts."),
        ("Automated Control", "Decides when to store solar and when to supply power to machines.")
    ], tag="2. Planning", tag_color=GOLD_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s6, 0.8 + (pipe_w + pipe_gap)*2, pipe_top, pipe_w, pipe_h, "Step 3: Power the Machines", [
        ("Runs Heavy Equipment", "Powers the 50t crane (45 kW), passenger hoists (28 kW), and site offices (12 kW)."),
        ("Smooths the Surge", "Instantly absorbs 94 kW motor kicks with zero breaker trips."),
        ("Zero Diesel Burn", "Clean, steady 415V power all day with zero fuel used.")
    ], tag="3. Operations", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s6, 0.8 + (pipe_w + pipe_gap)*3, pipe_top, pipe_w, pipe_h, "Step 4: Automatic Reports", [
        ("Noise Verified", "Logs that fence noise stayed at 54 dB, safely below government limits."),
        ("1-Click Audit Export", "Site officers download ready-to-sign DOE environmental reports in seconds."),
        ("Pushes to HQ", "Sends verified carbon reduction figures straight to Sime Darby management.")
    ], tag="4. Reporting", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s6, """SPEAKER NOTES [How It Works]
Here is the whole process in 4 simple steps:
In Step 1, solar panels charge a battery container, while our 4G box and sound meters track site metrics every second.
In Step 2, GreenPulse looks at weather radar and pre-charges the battery before afternoon rain.
In Step 3, the battery powers cranes, hoists, and offices cleanly, absorbing heavy motor surges in under 4 milliseconds.
In Step 4, it automatically logs compliance data, keeping noise under 55 decibels and generating 1-click reports for government officers and HQ.""")

    # ==========================================
    # SLIDE 7: 6. Impact
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7, BG_LIGHT)
    add_header(s7, "The Proof  |  6. Impact", "The Real Numbers: Money Saved, Payback, and Cleaner Air",
               "Based on real Malaysian commercial fuel prices, rental invoices, and government emission numbers")

    imp_w = 5.666
    imp_h = 2.45
    imp_top1 = 1.8
    imp_top2 = 4.5
    imp_left1 = 0.8
    imp_left2 = 6.866

    add_card(s7, imp_left1, imp_top1, imp_w, imp_h, "Save RM 125,000 Every Month per Site", [
        ("Avoided Diesel Bill", "Displaces 14,000 liters of commercial diesel @ RM 5.17 / L = RM 72,380 in saved fuel."),
        ("Cancelled Rental", "Stops renting 500 kVA generators & maintenance = RM 30,000 to RM 52,000 saved."),
        ("Total Monthly Savings", "RM 125,000 cash saved on every active site, every month.")
    ], tag="Cash Savings", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s7, imp_left2, imp_top1, imp_w, imp_h, "Full Payback in Just 14 Months", [
        ("Net Cash After Payments", "After paying monthly battery equipment financing (RM 18,500/mo), net savings are RM 106,000/mo."),
        ("14-Month Breakeven", "The entire battery setup pays for itself in 14.2 months."),
        ("Within 1 Project", "Fully paid off well before a standard 24-month building contract finishes.")
    ], tag="Fast Payback", tag_color=GOLD_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s7, imp_left1, imp_top2, imp_w, imp_h, "Cut Construction Carbon by 77%", [
        ("49 Tonnes CO2 Avoided", "Cuts 49.3 tonnes of carbon emissions every month on every site."),
        ("Clean Air Compliance", "Zero particulate matter, zero diesel fumes, and zero black smoke on site."),
        ("Helps Sime Darby Hit Targets", "Directly supports Sime Darby's goal to cut operational carbon 40% by 2030.")
    ], tag="Carbon Cut", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s7, imp_left2, imp_top2, imp_w, imp_h, "88% Quieter (Zero Noise Complaints)", [
        ("Down to 54 Decibels", "Replaces an 82 dB continuous generator drone with a quiet 54 dB battery."),
        ("Safely Below Legal Limits", "Well below the government 60 dB daytime residential noise limit."),
        ("No Stop-Work Orders", "Keeps neighbors happy and prevents costly government shutdown penalties.")
    ], tag="Quiet & Peaceful", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s7, """SPEAKER NOTES [Impact & Economics]
Let us look at the financial and environmental results:
First, we stop burning 14,000 liters of diesel at RM 5.17 per liter, and we cancel the generator rental. That saves RM 125,000 every single month per site.
Even after paying for the battery equipment, net savings are over RM 100,000 a month. The system pays for itself in just 14 months—well within a 2-year contract.
Second, we eliminate 49 tonnes of carbon emissions every month, cutting site emissions by 77%.
Third, we drop boundary noise from 82 decibels down to 54 decibels, eliminating complaints and stop-work risks.""")

    # ==========================================
    # SLIDE 8: 7. Feasibility
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8, BG_LIGHT)
    add_header(s8, "The Proof  |  7. Feasibility", "This Uses Proven Equipment That Is on Sites Today",
               "Zero unproven technology—GreenPulse works with commercial batteries already used in Malaysia")

    f_w = 3.64
    f_gap = 0.4
    f_top = 1.8
    f_h = 5.2

    add_card(s8, 0.8, f_top, f_w, f_h, "1. Proven Commercial Batteries", [
        ("Existing Hardware", "Built to run standard container batteries: MegaBatt 130 kW / 261 kWh and 522 kWh units."),
        ("Already Used in Malaysia", "Inta Bina already uses these exact MegaBatt containers at sites like P196 and Johan Setia."),
        ("Safe LFP Chemistry", "Uses Tier-1 lithium iron phosphate (LFP) cells rated for 6,000+ cycles with built-in aerosol fire suppression."),
        ("No Hardware Delay", "Ready to deploy immediately without waiting for custom manufacturing.")
    ], tag="Hardware Ready", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s8, 0.8 + f_w + f_gap, f_top, f_w, f_h, "2. Standard Plug-and-Play Setup", [
        ("Standard Cables", "Connects to standard inverters and battery boxes using regular industrial cables (Modbus & RS485)."),
        ("Standard Sound Meters", "Plugs into standard digital sound meters placed at the site fence."),
        ("Runs Safely Offline", "Stores 30 days of data locally on the gateway box. If mobile internet drops, power dispatch never stops."),
        ("Non-Invasive", "Requires zero changes to the site's electrical design or crane setup.")
    ], tag="Easy Integration", tag_color=NAVY_DARK, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s8, 0.8 + (f_w + f_gap)*2, f_top, f_w, f_h, "3. Working Prototype Built Today", [
        ("Live Web Platform", "We have a fully working prototype with all three role-based screens built and running."),
        ("Real Math & Models", "Runs live simulations for crane motor surges, rainstorm radar drops, and monthly cost savings."),
        ("Ready for Tender Docs", "We have prepared sample tender clauses ready to insert into Sime Darby contractor documents."),
        ("High Reliability", "Software SLA guarantees 99.9% power availability for construction work.")
    ], tag="Working Software", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s8, """SPEAKER NOTES [Feasibility]
Judges, deliverability is crucial. GreenPulse does not require inventing new hardware.
It works with commercially available container batteries like the MegaBatt units Inta Bina already runs at project site P196.
It connects using standard industrial cables. Even if mobile internet drops, the local controller keeps running safely.
Most importantly, our working prototype is finished and operational today. You can test live crane power, check sound levels, and export reports right now.""")

    # ==========================================
    # SLIDE 9: 8. Implementation
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9, BG_LIGHT)
    add_header(s9, "The Proof  |  8. Implementation", "12-Week Pilot Plan & 10-Year Value for Sime Darby",
               "Start with a quick site test, then scale across township developments for a decade of savings")

    # Left Container: 12-Week Pilot Plan
    add_card(s9, 0.8, 1.8, 5.666, 5.2, "12-Week Pilot Execution Plan", [
        ("Weeks 1 - 4: Green Tender Clause", "Add GreenPulse requirements into standard Sime Darby contractor tenders. Give bonus tender points to contractors who use clean battery power."),
        ("Weeks 5 - 8: Plug in the Hardware", "Install our 4G gateway on a battery container at an active site (like Putra Heights or Rimbayu) and place sound meters at the fence line."),
        ("Weeks 9 - 12: Train Site Teams & Audit", "Hand over screens to site engineers and safety officers. Start tracking real monthly cash savings and automatic carbon reports."),
        ("Scale Across Townships (2027 - 2030)", "Standardise across all major developments: City of Elmina, Bandar Bukit Raja, Nilai Impian, and Serenia City.")
    ], tag="12-Week Pilot", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    # Right Container: 10-Year Township Moat
    add_card(s9, 6.866, 1.8, 5.666, 5.2, "The 10-Year Township Advantage", [
        ("The Contractor Limit", "A contractor only cares about their single 2-year job. They cannot justify buying a big battery."),
        ("The Sime Darby Advantage", "Sime Darby develops entire townships over 10 to 15 years."),
        ("Sequential Redeployment Path", "Sime Darby can buy modular battery containers once, and move them as projects finish: Putra Heights (Years 1-2) -> Elmina West (Years 3-5) -> Bandar Bukit Raja (Years 6-10)."),
        ("RM 9.8 Million Net Savings", "Unlocks RM 9,840,000 in total net cash savings across a 3-phase township from one set of batteries."),
        ("Permanent Value", "Turns disposable generator rent into a reusable township asset.")
    ], tag="10-Year Township Moat", tag_color=EMERALD, bg_color=GREEN_TINT, border_color=EMERALD)

    set_speaker_notes(s9, """SPEAKER NOTES [Implementation]
Our implementation is straightforward:
Over 12 weeks, we add clean energy clauses into contractor tenders, plug our gateway into an active site battery, and start tracking savings.
Now look at the right side of this slide:
A single contractor cannot buy a battery for a 2-year project. But Sime Darby builds 15-year townships.
By buying battery containers centrally and moving them from Putra Heights to Elmina to Bandar Bukit Raja over a 10-year lifespan, Sime Darby unlocks RM 9.8 million in cumulative net savings.
That transforms disposable generator rental expense into a reusable township balance sheet asset.""")

    # ==========================================
    # SLIDE 10: Summary & The Ask
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10, BG_DARK)

    # Header
    cat_b10 = s10.shapes.add_textbox(Inches(1.0), Inches(0.6), Inches(11.333), Inches(0.4))
    tf_c10 = cat_b10.text_frame
    p_c10 = tf_c10.paragraphs[0]
    p_c10.text = "SIME DARBY PROPERTY UNIVERSITY HACKATHON 2026  |  THE ASK"
    p_c10.font.size = Pt(11)
    p_c10.font.bold = True
    p_c10.font.color.rgb = SDP_RED

    t_b10 = s10.shapes.add_textbox(Inches(1.0), Inches(0.95), Inches(11.333), Inches(0.7))
    tf_t10 = t_b10.text_frame
    p_t10 = tf_t10.paragraphs[0]
    p_t10.text = "Build the Townships of Tomorrow with Clean Power Today"
    p_t10.font.size = Pt(26)
    p_t10.font.bold = True
    p_t10.font.color.rgb = WHITE

    # 3 Summary Cards
    col_w = 3.55
    col_gap = 0.34
    col_top = 1.8
    col_h = 3.4

    add_card(s10, 1.0, col_top, col_w, col_h, "1. Unbeatable Financials", [
        ("Saves RM 125,000 / Month", "Cuts fuel and rental bills immediately on every active parcel."),
        ("14-Month Payback", "Pays for itself in 14 months, well within a 2-year project cycle."),
        ("RM 9.8M Township Moat", "Reusing batteries over 10 years unlocks multi-million Ringgit savings.")
    ], tag="Money", tag_color=EMERALD, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85), dark=True)

    add_card(s10, 1.0 + col_w + col_gap, col_top, col_w, col_h, "2. Solves the Real Problem", [
        ("Sub-4ms Power Boost", "Dampens 94 kW crane motor kicks so power never trips."),
        ("Weather Radar Sync", "Pre-charges batteries before afternoon rainstorms hit."),
        ("88% Quieter (54 dB)", "Stops neighbor noise complaints and DOE shutdown risks.")
    ], tag="Reliability", tag_color=BLUE_ACCENT, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85), dark=True)

    add_card(s10, 1.0 + (col_w + col_gap)*2, col_top, col_w, col_h, "3. Ready to Roll Out", [
        ("Uses Existing Batteries", "Works with proven MegaBatt containers already used in Malaysia."),
        ("Working Prototype", "Web platform and simulation modules are ready to test today."),
        ("First in Malaysia", "Makes Sime Darby the country's first zero-generator property developer.")
    ], tag="Readiness", tag_color=SDP_RED, bg_color=NAVY_SURFACE, border_color=RGBColor(51, 65, 85), dark=True)

    # Executive Ask Box
    ask_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(5.4), Inches(11.333), Inches(1.5))
    ask_card.fill.solid()
    ask_card.fill.fore_color.rgb = NAVY_SURFACE
    ask_card.line.color.rgb = SDP_RED
    ask_card.line.width = Pt(1.5)

    tb_ask = s10.shapes.add_textbox(Inches(1.25), Inches(5.5), Inches(10.833), Inches(1.3))
    tf_ask = tb_ask.text_frame
    tf_ask.word_wrap = True
    tf_ask.margin_left = tf_ask.margin_right = tf_ask.margin_top = tf_ask.margin_bottom = 0

    p_a0 = tf_ask.paragraphs[0]
    p_a0.text = "OUR ASK TO SIME DARBY PROPERTY LEADERSHIP:"
    p_a0.font.bold = True
    p_a0.font.size = Pt(13)
    p_a0.font.color.rgb = SDP_RED

    p_a1 = tf_ask.add_paragraph()
    p_a1.text = "1. Approve a 12-week pilot test on an active parcel (Putra Heights or City of Elmina).\n2. Partner with us to add clean battery rules into standard contractor tenders.\n3. Let's prove that the Township of Tomorrow starts with zero-diesel construction today."
    p_a1.font.size = Pt(11)
    p_a1.font.color.rgb = WHITE

    set_speaker_notes(s10, """SPEAKER NOTES [Conclusion & Ask]
In conclusion, judges: GreenPulse is direct, practical, and grounded in real Malaysian numbers.
It saves RM 125,000 every month per site, pays for itself in 14 months, and unlocks RM 9.8 million across a 10-year township.
Our ask to Sime Darby Property leadership is simple:
1. Approve a 12-week pilot test on an active parcel at Putra Heights or City of Elmina.
2. Help us write clean battery rules into standard contractor tenders.
3. Together, let us make Sime Darby Property Malaysia's first zero-generator property developer.
Thank you! We are Team Build with Geeks.""")

    # ==========================================
    # APPENDIX SLIDES (Supporting Details)
    # ==========================================
    # Appendix 1: Technical Details
    s11 = prs.slides.add_slide(blank_layout)
    set_bg(s11, BG_LIGHT)
    add_header(s11, "Appendix A  |  Technical Details", "How the 4G Gateway Box Talks to Inverters & Sensors",
               "Simple explanation of communication protocols, response times, and offline safety",
               category_color=BLUE_ACCENT)

    app_w = 3.64
    app_gap = 0.4
    app_top = 1.8
    app_h = 5.2

    add_card(s11, 0.8, app_top, app_w, app_h, "1. Inverter & Battery Reading", [
        ("Reads Power Every Second", "The 4G box connects to the inverter over a standard industrial cable (Modbus TCP) and reads power (kW), voltage, and frequency every 1 second."),
        ("Monitors Battery Health", "Tracks battery percentage (SOC %), temperature, and health so the battery is never overloaded."),
        ("Fast 4ms Boost", "When the crane motor starts, the box sends an instant command to deliver power in under 4 milliseconds.")
    ], tag="Industrial Protocols", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s11, 0.8 + app_w + app_gap, app_top, app_w, app_h, "2. Fence Sound Meter Processing", [
        ("Continuous Audio", "A digital sound meter on the fence line tracks noise levels every second."),
        ("Smart Noise Classifier", "Identifies the difference between site machines (cranes, hoists) and noisy highway dump trucks passing by."),
        ("Official Decibel Log", "Calculates official A-weighted decibels (dBA) for certified government compliance records.")
    ], tag="Sound Processing", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s11, 0.8 + (app_w + app_gap)*2, app_top, app_w, app_h, "3. Safe Offline Backup", [
        ("Stores 30 Days Locally", "If cellular internet drops, the box keeps 30 days of data in local storage."),
        ("Keeps Running Uninterrupted", "Local power control keeps running even during internet blackouts. The site never loses power."),
        ("Auto-Upload When Reconnected", "Once internet comes back, it automatically uploads all saved data to the cloud.")
    ], tag="Offline Reliability", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s11, """APPENDIX A: TECHNICAL DETAILS
The 4G gateway connects to inverters and batteries over standard industrial cables.
When a crane starts, power is boosted in under 4 milliseconds.
Audio processing filters out passing road trucks.
Local memory buffers 30 days of data so power dispatch continues even if cellular internet goes down.""")

    # Appendix 2: Financial Model & Tariff Breakdown
    s12 = prs.slides.add_slide(blank_layout)
    set_bg(s12, BG_LIGHT)
    add_header(s12, "Appendix B  |  Cost Breakdown", "Itemized Monthly Cash Flow: Diesel vs Clean Battery",
               "Full side-by-side comparison of conventional generator costs vs GreenPulse battery setup",
               category_color=BLUE_ACCENT)

    add_card(s12, 0.8, app_top, app_w, app_h, "1. What Sites Spend Today", [
        ("14,000L Diesel Burn", "14,000 Litres / month @ RM 5.17 / L = RM 72,380 in fuel invoices."),
        ("500 kVA Generator Rental", "RM 25,000 / month equipment rental fee to plant hire company."),
        ("Maintenance & Servicing", "RM 5,000 / month for oil changes, filters, and mechanic callouts."),
        ("Total Monthly Spend", "RM 102,380 to RM 125,000+ burned every month per site.")
    ], tag="Current Cost Drain", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s12, 0.8 + app_w + app_gap, app_top, app_w, app_h, "2. GreenPulse Clean Model", [
        ("Solar + Battery Setup", "RM 750,000 total capital cost for 169 kWp solar + 261 kWh MegaBatt container."),
        ("Equipment Financing", "RM 15,625 / month (spread over 48 months)."),
        ("Software & Maintenance", "RM 4,375 / month for software licence, cloud sync, and electrical checks."),
        ("Total Monthly Cost", "RM 20,000 / month total clean energy cost."),
        ("Net Cash Saved", "Over RM 100,000 / month in net cash savings.")
    ], tag="GreenPulse Model", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s12, 0.8 + (app_w + app_gap)*2, app_top, app_w, app_h, "3. Payback & 10-Year Returns", [
        ("14.2-Month Payback", "System pays for itself in 14.2 months based on net monthly savings."),
        ("Single Project Net Gain", "RM 1.77 million in net cash saved over a single 2-year construction contract."),
        ("10-Year Township Moat", "Moving containers across 3 township phases over 10 years yields RM 9.84 million in net savings.")
    ], tag="Long-Term Returns", tag_color=GOLD_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s12, """APPENDIX B: COST BREAKDOWN
Conventional generators cost RM 102k to RM 125k monthly in diesel and rental fees.
Under GreenPulse, equipment financing and software cost RM 20,000 monthly, leaving over RM 100,000 in net cash savings every month.
Payback takes just 14 months, and a 10-year fleet redeployment yields RM 9.84 million in net savings.""")

    # Appendix 3: Inta Bina P196 & Rimbayu CLQ Case Study Validation
    s13 = prs.slides.add_slide(blank_layout)
    set_bg(s13, BG_LIGHT)
    add_header(s13, "Appendix C  |  Real Site Proof", "Evidence from Inta Bina Site P196 & Rimbayu CLQ",
               "Real data from Malaysian construction projects and battery storage tests",
               category_color=BLUE_ACCENT)

    add_card(s13, 0.8, app_top, app_w, app_h, "1. Inta Bina Site P196 Proof", [
        ("Real Battery on Site", "A MegaBatt container is already deployed at Inta Bina project site P196."),
        ("Connected Machinery", "Powers a 50t Tower Crane, Passenger Hoist, Placing Boom, and Site Office."),
        ("Measured Crane Kick", "Site data confirms that when the crane lifts, it draws a sudden 94 kW motor surge."),
        ("The Lesson", "Proves heavy cranes can run on batteries, but need smart high-speed buffering so power does not trip.")
    ], tag="Site P196 Evidence", tag_color=NAVY_DARK, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s13, 0.8 + app_w + app_gap, app_top, app_w, app_h, "2. Rimbayu CLQ Hostel Baseline", [
        ("No Grid Power", "The Rimbayu worker quarters has no TNB power connection."),
        ("The Old Diesel Setup", "Ran two diesel generators (25 kVA and 50 kVA) burning 4,500 liters of diesel monthly."),
        ("Solar & Battery Upgrade", "Proposed 169.88 kWp rooftop solar + 2 x 261 kWh MegaBatt containers."),
        ("The Missing Piece", "Lacks smart weather forecasting, so batteries can deplete prematurely during consecutive rainy days.")
    ], tag="Rimbayu CLQ Case", tag_color=EMERALD, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s13, 0.8 + (app_w + app_gap)*2, app_top, app_w, app_h, "3. What GreenPulse Adds", [
        ("Adds the Smart Brain", "GreenPulse connects to the batteries and optimizes power automatically."),
        ("Stops Rain Blackouts", "Uses weather radar to pre-charge batteries before rainy days so power never dies."),
        ("Automatic Compliance", "Removes manual clipboard logs by generating instant digital compliance reports.")
    ], tag="Software Value", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s13, """APPENDIX C: CASE STUDY EVIDENCE
Our data is backed by real project evidence from Inta Bina:
At site P196, a MegaBatt battery powers a 50t tower crane and hoists, proving cranes can run on batteries.
At Rimbayu CLQ, 4,500 liters of diesel were burned monthly before solar and batteries were proposed.
GreenPulse provides the software brain that prevents rain blackouts and makes this hardware work reliably.""")

    # Appendix 4: Regulatory Standards & Team Credentials
    s14 = prs.slides.add_slide(blank_layout)
    set_bg(s14, BG_LIGHT)
    add_header(s14, "Appendix D  |  Rules & Team", "Malaysian Environmental Laws & Team Build with Geeks",
               "Regulatory compliance standards and our university team background",
               category_color=BLUE_ACCENT)

    add_card(s14, 0.8, app_top, app_w, app_h, "1. Malaysian Legal Rules", [
        ("DOE Noise Guidelines 2019", "Complies with Schedule 6 limits: 60 dB daytime and 45 dB nighttime at residential boundaries."),
        ("Clean Air Regulations 2014", "Guarantees zero dark smoke and zero particulate fumes under the Environmental Quality Act."),
        ("Bursa Malaysia ESG Reporting", "Follows Bursa Malaysia Sustainability Reporting Guide (3rd Edition) for construction emissions."),
        ("Fire & Electrical Standards", "Uses NFPA 855 and MS IEC 62619 standards for safe battery installation.")
    ], tag="Legal Rules", tag_color=SDP_RED, bg_color=CARD_BG, border_color=CARD_BORDER)

    add_card(s14, 0.8 + app_w + app_gap, app_top, 7.68, app_h, "2. Team Build with Geeks", [
        ("Our Background", "Build with Geeks: Multidisciplinary engineering, software, and finance university team."),
        ("Software & AI", "Built the working web platform, 4G gateway communication drivers, weather radar forecasting, and fence sound classifier."),
        ("Electrical Engineering", "Analyzed real tower crane motor load curves, battery inverter sizing, and fire safety systems."),
        ("Financial Modeling", "Built Malaysian commercial diesel cost models, Bursa ESG carbon calculations, and 10-year township fleet models."),
        ("Working Prototype Ready", "Live platform running with 3 role screens, storm simulation, and 1-click DOE PDF export ready for testing today."),
        ("Immediate Pilot Ready", "Prepared to deploy into an active Sime Darby parcel immediately.")
    ], tag="Our Team", tag_color=BLUE_ACCENT, bg_color=CARD_BG, border_color=CARD_BORDER)

    set_speaker_notes(s14, """APPENDIX D: RULES & TEAM
Our proposal follows all relevant Malaysian laws:
- DOE Environmental Noise Schedule 6 limits.
- Clean Air Regulations 2014.
- Bursa Malaysia Sustainability Reporting Guidelines.
Team Build with Geeks brings together software, electrical engineering, and financial modeling with a working prototype ready for immediate pilot testing.""")

    output_path = os.path.abspath("GreenPulse_SiteOS_Pitch_Deck_2026.pptx")
    prs.save(output_path)
    print(f"Direct, plain-English presentation successfully created at: {output_path}")

if __name__ == "__main__":
    build_presentation()
