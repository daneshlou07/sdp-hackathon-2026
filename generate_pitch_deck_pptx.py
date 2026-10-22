import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    BG_DARK = RGBColor(15, 23, 20)      # #0F1714 Dark Forest
    CARD_BG = RGBColor(28, 42, 39)      # #1C2A27 Container Surface
    CARD_BORDER = RGBColor(51, 77, 70)  # #334D46 Border
    EMERALD = RGBColor(46, 125, 91)     # #2E7D5B Active Green
    ORANGE = RGBColor(240, 122, 42)     # #F07A2A Highlight Orange
    RED = RGBColor(215, 25, 32)         # #D71920 Sime Darby Red
    WHITE = RGBColor(255, 255, 255)
    MUTED = RGBColor(163, 184, 176)     # #A3B8B0 Silver Mint
    LIGHT_BG = RGBColor(248, 250, 252)
    DARK_INK = RGBColor(15, 23, 42)

    def set_slide_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, category, title, dark=True):
        # Category Badge
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(10), Inches(0.4))
        tf = cat_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"SIME DARBY PROPERTY UNIVERSITY HACKATHON 2026  |  {category.upper()}"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = ORANGE if dark else RED

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.8))
        tf2 = title_box.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = title
        p2.font.size = Pt(26)
        p2.font.bold = True
        p2.font.color.rgb = WHITE if dark else DARK_INK

    def add_card(slide, left, top, width, height, title, body_bullets, tag=None, tag_color=EMERALD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        # Content Text Box
        tb = slide.shapes.add_textbox(Inches(left + 0.25), Inches(top + 0.2), Inches(width - 0.5), Inches(height - 0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        if tag:
            p0.text = f"[{tag.upper()}]  {title}"
            p0.font.bold = True
            p0.font.size = Pt(14)
            p0.font.color.rgb = tag_color
        else:
            p0.text = title
            p0.font.bold = True
            p0.font.size = Pt(15)
            p0.font.color.rgb = WHITE

        p_spacer = tf.add_paragraph()
        p_spacer.font.size = Pt(4)

        for b in body_bullets:
            pb = tf.add_paragraph()
            pb.text = f"•  {b}"
            pb.font.size = Pt(11)
            pb.font.color.rgb = MUTED
            pb.space_after = Pt(4)

    # -------------------------------------------------------------------------
    # SLIDE 1: Title & Executive Hook
    # -------------------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, BG_DARK)

    # Sub-header Pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(5.8), Inches(0.45))
    pill.fill.solid()
    pill.fill.fore_color.rgb = CARD_BG
    pill.line.color.rgb = CARD_BORDER
    tf = pill.text_frame
    p = tf.paragraphs[0]
    p.text = "TRACK: PLANET (ENERGY & DECARBONISATION)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    p.alignment = PP_ALIGN.CENTER

    # Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.85), Inches(11.5), Inches(2.2))
    tf = t_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "GreenPulse SiteOS"
    p.font.size = Pt(48)
    p.font.bold = True
    p.font.color.rgb = WHITE

    p2 = tf.add_paragraph()
    p2.text = "The Zero-Genset Site Energy Operating System"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = EMERALD

    p3 = tf.add_paragraph()
    p3.text = "Eliminating diesel generator rentals across active Sime Darby townships through intelligent BESS buffering, predictive load shifting, and statutory DOE compliance automation."
    p3.font.size = Pt(14)
    p3.font.color.rgb = MUTED
    p3.space_before = Pt(8)

    # 3 Highlight Stat Boxes
    stats = [
        ("RM 125,128", "Monthly Net Cash Saved Per Active Parcel", "Fuel (RM 95k) + Avoided Rental (RM 30k)", ORANGE),
        ("77.6%", "Scope 1 Carbon Abatement", "18.40 -> 4.12 kg CO2e / m2 CFA intensity", EMERALD),
        ("-27.9 dBA", "Acoustic Noise Reduction", "82 dBA genset drone -> 54.1 dBA clean power", WHITE)
    ]
    for i, (val, label, sub, color) in enumerate(stats):
        bx = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i * 3.9), Inches(4.5), Inches(3.7), Inches(2.1))
        bx.fill.solid()
        bx.fill.fore_color.rgb = CARD_BG
        bx.line.color.rgb = CARD_BORDER
        tf = bx.text_frame
        tf.word_wrap = True
        pv = tf.paragraphs[0]
        pv.text = val
        pv.font.size = Pt(32)
        pv.font.bold = True
        pv.font.color.rgb = color
        
        pl = tf.add_paragraph()
        pl.text = label
        pl.font.size = Pt(13)
        pl.font.bold = True
        pl.font.color.rgb = WHITE
        
        ps = tf.add_paragraph()
        ps.text = sub
        ps.font.size = Pt(10)
        ps.font.color.rgb = MUTED
        ps.space_before = Pt(4)

    s1.notes_slide.notes_text_frame.text = (
        "Judges, welcome. We represent Team Build With Geeks. "
        "Sime Darby Property is Malaysia's premier township master developer, leading the nation toward 40% carbon intensity reduction by 2030 and Net Zero by 2050. "
        "Yet every greenfield parcel breaking ground today carries a multi-million ringgit blind spot: temporary construction diesel power. "
        "We built GreenPulse SiteOS to eliminate this cash bleed and regulatory threat completely."
    )

    # -------------------------------------------------------------------------
    # SLIDE 2: The Story 1 - Problem
    # -------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, BG_DARK)
    add_header(s2, "The Story : 1. Problem", "The Temporary Power Blind Spot on Active Greenfield Parcels")

    add_card(s2, 0.8, 1.8, 3.7, 4.8, "1. Permanent Grid Delay", [
        "Permanent TNB 11kV/33kV substations require 9 to 18 months to commission.",
        "Early structural works (pilings, substructure, tower cranes) must start day one.",
        "Contractors are forced into 100% off-grid temporary power setups.",
        "Township scale: Multiplied across City of Elmina, Serenia City, and Bandar Bukit Raja simultaneously."
    ], tag="Grid Reality", tag_color=RED)

    add_card(s2, 4.8, 1.8, 3.7, 4.8, "2. Unsubsidised Diesel Shock", [
        "Commercial construction is 100% excluded from BUDI Madani diesel subsidies.",
        "Commercial Euro 5 diesel costs RM 5.17 per litre (market price).",
        "An active site burns 12,000L to 14,000L monthly, costing over RM 65,000 in fuel alone.",
        "Equipment hire firms charge RM 15,000 to RM 35,000/mo just for generator rental."
    ], tag="Financial Drain", tag_color=ORANGE)

    add_card(s2, 8.8, 1.8, 3.7, 4.8, "3. Acoustic & ESG Penalties", [
        "500 kVA generators emit continuous 82 dBA drone at 10 meters distance.",
        "Violates DOE Planning Guidelines Schedule 6 limits (60 dBA Day / 45 dBA Night).",
        "Triggers immediate residential complaints from neighboring completed phases.",
        "Risk of DOE Stop-Work orders stalling millions in structural works."
    ], tag="Regulatory Threat", tag_color=RED)

    s2.notes_slide.notes_text_frame.text = (
        "The problem is systemic: permanent TNB grid supply arrives 9 to 18 months after construction begins. "
        "Because construction is excluded from BUDI Madani diesel subsidies, contractors pay the commercial rate of RM 5.17 per litre. "
        "Together with generator rental, a single active parcel burns RM 95,000 to RM 125,000 every single month in pure operational waste. "
        "Worse, 82 dBA generator noise directly threatens statutory DOE noise compliance, risking immediate stop-work orders."
    )

    # -------------------------------------------------------------------------
    # SLIDE 3: The Story 2 - Target User
    # -------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, BG_DARK)
    add_header(s3, "The Story : 2. Target User", "Three Interconnected Personas Across the Construction Hierarchy")

    add_card(s3, 0.8, 1.8, 3.7, 4.8, "M&E Site Manager", [
        "Persona: Encik Hafiz (Inta Bina / Main Contractor M&E Lead).",
        "Daily Headache: Voltage dips and breaker trips caused by 94 kW tower crane motor inrush.",
        "Operational Pain: Managing diesel deliveries, fuel theft risks, and machine downtime.",
        "Needs: Reliable, unbreakable power with instant sub-millisecond surge dampening."
    ], tag="Operational Tier", tag_color=ORANGE)

    add_card(s3, 4.8, 1.8, 3.7, 4.8, "Site Environmental Officer", [
        "Persona: Puan Nurul (Licensed Environmental Officer, DOE liaison).",
        "Daily Headache: Noise meters spiking at residential boundaries; midnight complaints.",
        "Operational Pain: Compiling weekly manual paper logs for Jabatan Alam Sekitar.",
        "Needs: Real-time acoustic boundary audit, zero exhaust smoke, and 1-click statutory EMP reporting."
    ], tag="Compliance Tier", tag_color=EMERALD)

    add_card(s3, 8.8, 1.8, 3.7, 4.8, "HQ Development Director", [
        "Persona: Ir. Ts. Tan (Sime Darby Property Executive Management).",
        "Corporate Headache: Escalating OpEx invoices, budgeting for diesel inflation.",
        "Corporate Mandate: Bursa Malaysia CSI Scope 1 carbon intensity targets (kg CO2e/m2).",
        "Needs: Clear ROI, cross-township BESS asset mobility, and audited ESG metrics."
    ], tag="Executive Tier", tag_color=WHITE)

    s3.notes_slide.notes_text_frame.text = (
        "GreenPulse connects all three critical stakeholders in the property development lifecycle. "
        "The M&E Manager on site gets unbreakable power that never trips when a heavy crane hoists concrete. "
        "The Environmental Officer gets automated boundary noise compliance that protects the project from DOE stop-work notices. "
        "And the HQ Development Director gets an audited ESG reporting pipeline with proven 14.2-month payback."
    )

    # -------------------------------------------------------------------------
    # SLIDE 4: The Story 3 - Solution
    # -------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, BG_DARK)
    add_header(s4, "The Story : 3. Solution", "GreenPulse SiteOS: The Integrated Multi-Role Operating Platform")

    add_card(s4, 0.8, 1.8, 3.7, 4.8, "M&E Operations Screen", [
        "Live Sub-Cycle Inrush Buffer: Dampens 94 kW inductive motor kicks in < 4 milliseconds.",
        "Machinery Circuit Control: Dynamic breaker management for Cranes, Hoists, and CLQ Quarters.",
        "Autonomous Weather Dispatch: Pre-charges BESS to 88% ahead of afternoon storm clouds.",
        "EV Fleet Charging: Schedules 60 kW forklift charging using clean mid-day solar surplus."
    ], tag="M&E Manager View", tag_color=ORANGE)

    add_card(s4, 4.8, 1.8, 3.7, 4.8, "Environmental & Boundary Screen", [
        "Live Acoustic Meter: Boundary L90 noise audit (54.1 dBA vs 60 dBA Day Limit).",
        "Acoustic Source Separation: Separates site noise from external public road tipper trucks.",
        "Water & Silt Runoff: Real-time turbidity sensor monitoring (< 50 NTU compliance).",
        "1-Click Statutory Filing: Generates official Monthly EMP attachments for DOE submission."
    ], tag="Environmental Officer", tag_color=EMERALD)

    add_card(s4, 8.8, 1.8, 3.7, 4.8, "HQ Portfolio & ESG Screen", [
        "Commercial Diesel Ticker: Live RM 5.17 / L economic indexation across all active parcels.",
        "Multi-Township Redeployment: Tracks BESS asset moves across Elmina, Serenia, and Bukit Raja.",
        "Bursa CSI ESG Disclosure: Certified Scope 1 carbon abatement reporting.",
        "Pre-Tender Sizing Calculator: Embeds zero-genset power requirements into new subcontracts."
    ], tag="HQ Executive View", tag_color=WHITE)

    s4.notes_slide.notes_text_frame.text = (
        "GreenPulse SiteOS is not just hardware; it is the intelligent software operating layer. "
        "It synchronizes containerized BESS hardware, solar arrays, and high-frequency site machinery into an autonomous power utility. "
        "Each stakeholder receives an engineered, purpose-built interface that solves their exact operational pain point."
    )

    # -------------------------------------------------------------------------
    # SLIDE 5: The Story 4 - Innovation
    # -------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, BG_DARK)
    add_header(s5, "The Story : 4. Innovation", "Deep Tech Innovation: Why GreenPulse Is Industrially Defensible")

    add_card(s5, 0.8, 1.8, 5.7, 2.3, "1. Sub-4ms SurgeGuard Inrush Buffer", [
        "Conventional inverters trip under inductive motor starts (45 kW nominal -> 94 kW surge).",
        "SurgeGuard algorithmic buffering delivers 200 kW peak surge for 10 seconds with 3.8ms IGBT response.",
        "Guarantees 0.0% breaker trips during dual simultaneous crane and passenger hoist starts."
    ], tag="High-Speed Power Electronics", tag_color=EMERALD)

    add_card(s5, 6.8, 1.8, 5.7, 2.3, "2. Physics-Informed SolarCast ML", [
        "Monsoon cloudbursts cause sudden 85% solar drops within 60 seconds.",
        "SolarCast pairs MET Malaysia Doppler radar with solar zenith geometry for 24-hr forecasting.",
        "Pre-charges battery before rain hits, completely eliminating generator auto-starts."
    ], tag="Predictive Meteorology", tag_color=ORANGE)

    add_card(s5, 0.8, 4.3, 5.7, 2.3, "3. EchoShield Acoustic Edge AI", [
        "Conventional sound meters register raw spikes from passing highway traffic.",
        "EchoShield analyzes spectral energy distribution (63 Hz - 125 Hz dump truck signature).",
        "Isolates true site boundary noise (54.1 dBA) and suppresses false statutory alarms."
    ], tag="Edge Acoustic Signal Processing", tag_color=ORANGE)

    add_card(s5, 6.8, 4.3, 5.7, 2.3, "4. Multi-Role SiteOps Copilot", [
        "Role-conditioned AI assistant trained on DOE Schedule 6 and Malaysian construction standards.",
        "Executes deterministic power simulations, motor surge calculations, and EMP draft generation.",
        "Zero hallucination: Built on verified mathematical engineering and statutory legal models."
    ], tag="Domain-Tuned Cognitive AI", tag_color=EMERALD)

    s5.notes_slide.notes_text_frame.text = (
        "What makes GreenPulse truly innovative? Four deep engineering moats. "
        "First, SurgeGuard absorbs heavy inductive crane kicks in less than 4 milliseconds. "
        "Second, SolarCast reads MET Malaysia radar to anticipate tropical cloud cover. "
        "Third, EchoShield uses edge ML to prove passing highway trucks aren't site violations. "
        "And fourth, SiteOps Copilot provides deterministic, certified engineering reasoning on demand."
    )

    # -------------------------------------------------------------------------
    # SLIDE 6: The Proof 5 - How It Works
    # -------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, BG_DARK)
    add_header(s6, "The Proof : 5. How It Works", "Hardware-Software Orchestration Architecture")

    # 4 Architecture Stages
    stages = [
        ("Step 1: Clean Harvest", "Solar PV + BESS", [
            "150 - 300 kWp rooftop / ground solar array.",
            "261 - 522 kWh containerised LFP BESS.",
            "High-frequency 400 kW hybrid bidirectional inverter."
        ], EMERALD),
        ("Step 2: Edge Telemetry", "4G IoT Site Gateway", [
            "Sub-second inverter voltage and frequency sampling.",
            "Class 1 boundary acoustic noise sensors.",
            "Smart sub-distribution breakers (CB-01 to CB-06)."
        ], ORANGE),
        ("Step 3: AI Optimisation", "Cloud Model Predictive Control", [
            "MPC DispatchOpt solves dynamic cost optimization.",
            "Load shifting algorithms schedule EV forklift charging.",
            "Surge headroom preservation prevents voltage dip."
        ], WHITE),
        ("Step 4: Unified Command", "Role-Conditioned Web App", [
            "M&E Manager: Machinery breaker dispatch.",
            "EO: Live statutory DOE noise margin meter.",
            "HQ: Portfolio cash savings ledger and fleet scheduler."
        ], EMERALD)
    ]
    for i, (title, sub, bullets, color) in enumerate(stages):
        add_card(s6, 0.8 + i * 2.95, 1.8, 2.8, 4.8, title, bullets, tag=sub, tag_color=color)

    s6.notes_slide.notes_text_frame.text = (
        "Here is the system architecture in practice. "
        "Solar generation and LFP battery storage feed into a high-speed hybrid inverter. "
        "An on-site 4G IoT gateway continuously measures bus voltage, circuit loads, and boundary acoustic sound levels. "
        "Our cloud MPC algorithms optimize energy flows every 15 minutes, pushing telemetry to the 3 responsive web screens in real time."
    )

    # -------------------------------------------------------------------------
    # SLIDE 7: The Proof 6 - Impact
    # -------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, BG_DARK)
    add_header(s7, "The Proof : 6. Impact", "Proven Financial, Environmental, and Community Returns")

    add_card(s7, 0.8, 1.8, 3.7, 4.8, "Direct Financial Return", [
        "Fuel Cost Elimination: Saves 18,400L of Euro 5 diesel monthly (RM 95,128/mo).",
        "Rental Avoidance: Cancels 500 kVA generator rental contract (RM 30,000/mo).",
        "Net Cash Savings: RM 125,128 net operational savings per parcel every month.",
        "Capital Payback: Fast 14.2 months against turnkey container capex."
    ], tag="Economic Dividend", tag_color=ORANGE)

    add_card(s7, 4.8, 1.8, 3.7, 4.8, "Environmental Decarbonisation", [
        "Scope 1 Reduction: 77.6% drop in construction phase carbon intensity.",
        "Carbon Benchmark: Reduces emissions from 18.40 kg to 4.12 kg CO2e / m2 CFA.",
        "Clean Air Quality: 100% elimination of particulate matter (PM2.5/PM10) and unburnt diesel exhaust.",
        "Bursa Compliance: Ready for Annual Integrated Report ESG audit."
    ], tag="Planet Track Goal", tag_color=EMERALD)

    add_card(s7, 8.8, 1.8, 3.7, 4.8, "Social & Community Harmony", [
        "Acoustic Dampening: Measured -27.9 dBA noise attenuation (88% perceived quietening).",
        "Statutory Margin: Boundary sound remains at 54.1 dBA (comfortably under 60 dBA Day / 45 dBA Night).",
        "Resident Portal: 100% anonymous digital feedback for neighbors with verified resolution tracking.",
        "Zero Stop-Work Risk: Guaranteed statutory compliance under Environmental Quality Act 1974."
    ], tag="Community Goodwill", tag_color=WHITE)

    s7.notes_slide.notes_text_frame.text = (
        "GreenPulse delivers verified impact across all three ESG pillars. "
        "Financially, it saves over RM 125,000 in cash per parcel each month, delivering full capital payback in just 14.2 months. "
        "Environmentally, it abates 77.6% of Scope 1 construction emissions. "
        "And socially, it cuts boundary sound by nearly 28 decibels, eliminating community disputes."
    )

    # -------------------------------------------------------------------------
    # SLIDE 8: The Proof 7 - Feasibility
    # -------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, BG_DARK)
    add_header(s8, "The Proof : 7. Feasibility", "Bankable Unit Economics & Turnkey Operational Viability")

    # Financial Comparison Table Card
    card_table = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(6.8), Inches(4.8))
    card_table.fill.solid()
    card_table.fill.fore_color.rgb = CARD_BG
    card_table.line.color.rgb = CARD_BORDER

    tf_t = card_table.text_frame
    tf_t.word_wrap = True
    p = tf_t.paragraphs[0]
    p.text = "[UNIT ECONOMICS]  24-Month Project Lifecycle Analysis"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ORANGE

    rows_data = [
        ("Operating Parameter", "Status Quo (500 kVA Genset)", "GreenPulse SiteOS", "Sime Darby Benefit"),
        ("Monthly Commercial Fuel", "RM 95,128 (18,400 L @ RM 5.17)", "RM 0 (Clean Solar + BESS)", "- RM 95,128 / month"),
        ("Monthly Equipment Rental", "RM 30,000 (Rented genset)", "RM 0 (Township asset)", "- RM 30,000 / month"),
        ("Total 24-Mo Operating Cost", "RM 3,003,072 cash drain", "RM 0 operational burn", "+ RM 3.00 Million cash retained"),
        ("Boundary Noise Level", "82.0 dBA (DOE Non-compliant)", "54.1 dBA (Fully compliant)", "- 27.9 dBA noise attenuation"),
        ("Carbon Emission Intensity", "18.40 kg CO2e / m2 CFA", "4.12 kg CO2e / m2 CFA", "- 77.6% Scope 1 reduction"),
        ("Equipment Residual Value", "RM 0 (Rental vanishes)", "RM 350,000 (10-yr mobile asset)", "Fully amortised in 14.2 mos")
    ]

    p_sp = tf_t.add_paragraph()
    p_sp.font.size = Pt(6)

    for row in rows_data[1:]:
        p_r = tf_t.add_paragraph()
        p_r.text = f"• {row[0]}: {row[2]} (vs {row[1]}) -> {row[3]}"
        p_r.font.size = Pt(10.5)
        p_r.font.color.rgb = WHITE if "- RM" in row[3] or "+ RM" in row[3] else MUTED
        p_r.space_after = Pt(4)

    # Risk Mitigation Card
    add_card(s8, 7.9, 1.8, 4.6, 4.8, "Technical & Commercial De-risking", [
        "Proven Tier-1 Hardware: Uses CATL / BYD LiFePO4 chemistry with 6,000+ cycle lifespan.",
        "Turnkey Containerised Deployment: Standard 20ft/40ft ISO container format installs on gravel pad in 48 hours.",
        "Zero Production Downtime Risk: In the extreme event of BESS depletion, backup grid/genset transfer switch acts within 10ms.",
        "Commercial Diesel Arbitrage: Payback accelerates further if diesel prices rise to RM 5.80 / L."
    ], tag="Bankability", tag_color=EMERALD)

    s8.notes_slide.notes_text_frame.text = (
        "GreenPulse is not a theoretical science project; it is grounded in bankable commercial mathematics. "
        "A typical 24-month structural construction phase burns over RM 3 million in diesel fuel and generator rentals. "
        "GreenPulse saves that cash entirely. With Tier-1 LFP cells rated for 6,000 cycles, the equipment pays for itself in 14.2 months, leaving 8+ years of free energy generation."
    )

    # -------------------------------------------------------------------------
    # SLIDE 9: The Proof 8 - Implementation
    # -------------------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, BG_DARK)
    add_header(s9, "The Proof : 8. Implementation", "Phased Rollout Across Active Sime Darby Townships")

    add_card(s9, 0.8, 1.8, 3.7, 4.8, "Phase 1: Pilot Validation", [
        "Site: City of Elmina (Shah Alam)",
        "Focus: Kanopi Residences topping off & Elmina Green phases.",
        "Timeline: Q1 - Q2 2027 (6 Months).",
        "Hardware: 261 kWh BESS + 150 kWp Solar PV.",
        "Objective: Validate SurgeGuard crane inrush dampening and calibrate local Doppler radar ML."
    ], tag="Pilot Site 1", tag_color=EMERALD)

    add_card(s9, 4.8, 1.8, 3.7, 4.8, "Phase 2: Residential Link Expansion", [
        "Site: Serenia City (Sepang)",
        "Focus: Serenia Baleria link homes & commercial precinct.",
        "Timeline: Q3 2027 - Q1 2028 (8 Months).",
        "Hardware: 522 kWh BESS + 300 kWp Solar PV.",
        "Objective: Scale to dual tower crane operation and validate EchoShield residential acoustic boundary isolation."
    ], tag="Expansion Site 2", tag_color=ORANGE)

    add_card(s9, 8.8, 1.8, 3.7, 4.8, "Phase 3: Heavy Industrial Park", [
        "Site: Bandar Bukit Raja (Klang)",
        "Focus: Bukit Raja Industrial Park & The Straits.",
        "Timeline: Q2 2028 - Q4 2029 (18 Months).",
        "Hardware: Multi-container BESS fleet.",
        "Objective: Full integration into Sime Darby standard sustainable construction tender specifications."
    ], tag="Township Scale Site 3", tag_color=WHITE)

    s9.notes_slide.notes_text_frame.text = (
        "Our implementation roadmap targets three active, prestigious Sime Darby townships. "
        "We start at City of Elmina on the Kanopi Residences topping off phase. "
        "Next, we expand to Serenia City for the Baleria link homes. "
        "Finally, we scale to Bandar Bukit Raja Industrial Park, institutionalizing GreenPulse SiteOS across the entire group."
    )

    # -------------------------------------------------------------------------
    # SLIDE 10: Conclusion & The Ask
    # -------------------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, BG_DARK)
    add_header(s10, "Conclusion & Next Steps", "Bringing Zero-Genset Construction to Sime Darby Property")

    # Big Summary Card
    card_sum = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(7.5), Inches(4.8))
    card_sum.fill.solid()
    card_sum.fill.fore_color.rgb = CARD_BG
    card_sum.line.color.rgb = CARD_BORDER

    tf_s = card_sum.text_frame
    tf_s.word_wrap = True
    p = tf_s.paragraphs[0]
    p.text = "Decarbonisation Is Not a Cost Center. It Is an Immediate OpEx Dividend."
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = WHITE

    summary_bullets = [
        "Financial Certainty: Eliminates RM 125,128/month in diesel invoices and rental charges per parcel.",
        "Statutory Peace of Mind: Guarantees DOE Schedule 6 boundary acoustic compliance (54.1 dBA).",
        "10-Year Multi-Township Asset: Sequential redeployment unlocks RM 9.84 Million cumulative net value per BESS unit.",
        "Fully Operational Prototype: Working web software, live API weather telemetry, and validated engineering models ready today."
    ]
    p_sp = tf_s.add_paragraph()
    p_sp.font.size = Pt(6)

    for b in summary_bullets:
        pb = tf_s.add_paragraph()
        pb.text = f"✓  {b}"
        pb.font.size = Pt(13)
        pb.font.color.rgb = MUTED
        pb.space_after = Pt(8)

    # The Ask Card
    add_card(s10, 8.6, 1.8, 3.9, 4.8, "The Ask to Leadership", [
        "1. Pilot Parcel Endorsement: Authorise a 6-month pilot deployment at City of Elmina.",
        "2. Contractor Gateway Access: Partner with Inta Bina site management for IoT gateway mounting.",
        "3. Tender Specification Mandate: Incorporate GreenPulse SiteOS as the designated clean temporary power benchmark in 2027 development tenders."
    ], tag="Next Steps", tag_color=ORANGE)

    s10.notes_slide.notes_text_frame.text = (
        "In conclusion, GreenPulse proves that construction decarbonisation is not an expensive luxury; it is a cash-generating operational advantage. "
        "Our software, prototype, and engineering models are complete. "
        "We ask Sime Darby Property leadership for one endorsement: approve the City of Elmina pilot parcel today, and let us build the clean future together. Thank you."
    )

    # -------------------------------------------------------------------------
    # APPENDIX SLIDES
    # -------------------------------------------------------------------------
    # Appendix 1: Motor Inrush Physics
    s_a1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s_a1, BG_DARK)
    add_header(s_a1, "Appendix A : Electrical Physics", "SurgeGuard Sub-4ms Inductive Motor Inrush Absorption")
    add_card(s_a1, 0.8, 1.8, 5.7, 4.8, "The Inductive Inrush Problem", [
        "Electric motors draw high magnetising current during rotor acceleration (L/R time constant).",
        "A 45 kW tower crane hoisting 2.5 tonnes draws 94 kW instantaneous surge for 1.8 seconds.",
        "Traditional generators suffer severe voltage dips (down to 320V), triggering undervoltage trip relays.",
        "Contractors over-specify 500 kVA generators solely to buffer this 2-second kick."
    ], tag="Physics Challenge", tag_color=RED)
    add_card(s_a1, 6.8, 1.8, 5.7, 4.8, "SurgeGuard Active Mitigation", [
        "Inverter response time: 3.8 ms using insulated-gate bipolar transistors (IGBTs).",
        "MegaBatt 522 kWh hybrid inverter provides 200 kW peak surge capacity for 10 seconds.",
        "High-frequency DC-bus capacitance buffers the initial 50 ms transient kick instantly.",
        "Result: Main bus voltage remains stable within +/- 1.5% tolerance (400V +/- 6V)."
    ], tag="SurgeGuard Solution", tag_color=EMERALD)

    # Appendix 2: Commercial Diesel Sensitivity
    s_a2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s_a2, BG_DARK)
    add_header(s_a2, "Appendix B : Financial Sensitivity", "Unsubsidised Euro 5 Diesel Price Escalation Sensitivity")
    add_card(s_a2, 0.8, 1.8, 5.7, 4.8, "Malaysian Diesel Deregulation Scenarios", [
        "Baseline Scenario (RM 5.17 / L): Monthly fuel OpEx saved = RM 95,128. Total monthly savings = RM 125,128.",
        "Escalated Scenario (RM 5.80 / L): Monthly fuel OpEx saved = RM 106,720. Total monthly savings = RM 136,720.",
        "Global Crude Spike (RM 6.50 / L): Monthly fuel OpEx saved = RM 119,600. Total monthly savings = RM 149,600.",
        "Economic Takeaway: Higher fossil fuel volatility increases the ROI and financial buffer of GreenPulse."
    ], tag="Macro Sensitivity", tag_color=ORANGE)
    add_card(s_a2, 6.8, 1.8, 5.7, 4.8, "Capital Payback Compression", [
        "At RM 5.17 / L: Payback = 14.2 months.",
        "At RM 5.80 / L: Payback compresses to 12.8 months.",
        "At RM 6.50 / L: Payback compresses to 11.4 months.",
        "Long-term value: Asset provides free, amortised clean energy for the remaining 8.5+ years of operational life."
    ], tag="Payback Acceleration", tag_color=EMERALD)

    # Appendix 3: Statutory Environmental Compliance
    s_a3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s_a3, BG_DARK)
    add_header(s_a3, "Appendix C : Statutory Framework", "DOE Schedule 6 & Environmental Quality Act 1974 Alignment")
    add_card(s_a3, 0.8, 1.8, 5.7, 4.8, "Statutory Legal Limits", [
        "DOE Planning Guidelines for Environmental Noise Limits and Control (Schedule 6):",
        "• Daytime (07:00 - 19:00): 60.0 dBA L90 limit at residential boundary.",
        "• Evening (19:00 - 22:00): 55.0 dBA L90 limit at residential boundary.",
        "• Night (22:00 - 07:00): 45.0 dBA L90 limit (Strict curfew; home limits apply).",
        "Penalties: RM 100,000 fine and mandatory Stop-Work order under Environmental Quality Act."
    ], tag="DOE Regulations", tag_color=RED)
    add_card(s_a3, 6.8, 1.8, 5.7, 4.8, "GreenPulse Audit Trail", [
        "Measured Site Boundary Noise: 54.1 dBA (Complies with daytime 60 dBA and evening 55 dBA limits).",
        "Night Operation: Zero noise emission enables silent CLQ worker quarter air conditioning.",
        "Clean Air Regulations 2014: 0% Ringelmann smoke opacity; zero carbon monoxide / unburnt diesel exhaust.",
        "Audited Reporting: Pre-formatted digital PDF export directly compatible with monthly DOE Environmental Management Plans (EMP)."
    ], tag="Full Compliance", tag_color=EMERALD)

    # Save Presentation
    output_path = r"c:\Users\Danesh Lou\Downloads\Sime Darby Hackathon\GreenPulse_Pitch_Deck.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_deck()
