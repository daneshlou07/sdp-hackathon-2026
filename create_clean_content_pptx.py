import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

def build_content_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Use standard blank slide layout (index 6) so we place clean standard text boxes
    blank_layout = prs.slide_layouts[6]

    DARK_TEXT = RGBColor(15, 23, 42)      # Deep Navy / Charcoal
    MUTED_TEXT = RGBColor(71, 85, 105)    # Slate
    CATEGORY_TEXT = RGBColor(190, 24, 38) # Dark Red Accent

    def add_standard_slide(title_text, category_text, bullet_sections, speaker_note=""):
        slide = prs.slides.add_slide(blank_layout)
        
        # 1. Category / Track Tracker
        if category_text:
            cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
            tf_cat = cat_box.text_frame
            tf_cat.word_wrap = True
            tf_cat.margin_left = tf_cat.margin_right = tf_cat.margin_top = tf_cat.margin_bottom = 0
            p_cat = tf_cat.paragraphs[0]
            p_cat.text = category_text.upper()
            p_cat.font.size = Pt(11)
            p_cat.font.bold = True
            p_cat.font.color.rgb = CATEGORY_TEXT

        # 2. Main Title (Strictly the SDP criteria title)
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(28)
        p_title.font.bold = True
        p_title.font.color.rgb = DARK_TEXT

        # 3. Content Body (Standard multi-column or vertical list)
        num_sections = len(bullet_sections)
        if num_sections == 1:
            col_width = 11.7
            left_margin = 0.8
            box = slide.shapes.add_textbox(Inches(left_margin), Inches(1.8), Inches(col_width), Inches(5.2))
            tf_b = box.text_frame
            tf_b.word_wrap = True
            tf_b.margin_left = tf_b.margin_right = tf_b.margin_top = tf_b.margin_bottom = 0
            
            section_title, bullets = bullet_sections[0]
            first = True
            if section_title:
                p_st = tf_b.paragraphs[0]
                p_st.text = section_title
                p_st.font.size = Pt(16)
                p_st.font.bold = True
                p_st.font.color.rgb = DARK_TEXT
                p_st.space_after = Pt(8)
                first = False

            for b in bullets:
                p = tf_b.paragraphs[0] if first else tf_b.add_paragraph()
                first = False
                p.text = f"• {b}"
                p.font.size = Pt(13)
                p.font.color.rgb = DARK_TEXT
                p.space_after = Pt(8)

        else:
            # Multi-column layout
            gap = 0.4
            total_gap = gap * (num_sections - 1)
            col_width = (11.7 - total_gap) / num_sections

            for i, (sec_title, bullets) in enumerate(bullet_sections):
                col_left = 0.8 + i * (col_width + gap)
                box = slide.shapes.add_textbox(Inches(col_left), Inches(1.8), Inches(col_width), Inches(5.2))
                tf_b = box.text_frame
                tf_b.word_wrap = True
                tf_b.margin_left = tf_b.margin_right = tf_b.margin_top = tf_b.margin_bottom = 0

                p_st = tf_b.paragraphs[0]
                p_st.text = sec_title
                p_st.font.size = Pt(15)
                p_st.font.bold = True
                p_st.font.color.rgb = DARK_TEXT
                p_st.space_after = Pt(10)

                for b in bullets:
                    p = tf_b.add_paragraph()
                    p.text = f"• {b}"
                    p.font.size = Pt(12)
                    p.font.color.rgb = DARK_TEXT
                    p.space_after = Pt(8)

        # 4. Speaker Notes Pane
        if speaker_note:
            slide.notes_slide.notes_text_frame.text = speaker_note

        return slide

    # =========================================================================
    # SLIDE 1: Title & Executive Hook
    # =========================================================================
    add_standard_slide(
        title_text="GreenPulse SiteOS: Zero-Genset Site Energy Operating System",
        category_text="Sime Darby Property University Hackathon 2026 | Track: Planet",
        bullet_sections=[
            ("Executive Summary", [
                "Target: Eliminating temporary construction diesel generator rentals across Sime Darby Property greenfield townships.",
                "Technology: Containerised Battery Energy Storage Systems (BESS) + on-site solar PV + intelligent real-time microgrid orchestration software.",
                "Key Metric 1: RM 125,128 per month net cash saved per active high-rise construction parcel.",
                "Key Metric 2: 77.6% Scope 1 direct carbon emission reduction (49.3 tonnes CO2e eliminated monthly).",
                "Key Metric 3: 14.2-month capital payback period, paying for itself before the 18-month civil phase finishes.",
                "Target Townships: Engineered for deployment across City of Elmina, Serenia City, and Bandar Bukit Raja."
            ])
        ],
        speaker_note="Judges, Sime Darby Property leads Malaysia toward 40% carbon reduction by 2030 and Net Zero by 2050. However, every major township parcel breaking ground carries a multi-million Ringgit operational blind spot: temporary construction power. GreenPulse SiteOS eliminates this financial drain, cuts direct carbon by 77.6%, and transforms temporary energy waste into a reusable township asset."
    )

    # =========================================================================
    # SLIDE 2: 1. Problem (The Story)
    # =========================================================================
    add_standard_slide(
        title_text="1. Problem",
        category_text="The Story : Area 1",
        bullet_sections=[
            ("Grid & Fuel Shock", [
                "18-Month Utility Substation Gap: Permanent TNB 11kV/33kV substations take 9 to 18 months to commission, forcing 100% off-grid temporary power setups day one.",
                "No Fuel Subsidies (BUDI Madani): Commercial construction is fully excluded from retail fuel subsidies. Sites pay commercial Euro 5 market rates of RM 5.17 per litre.",
                "Massive Fuel Bleed: Active parcels consume 12,000 to 14,000 litres of diesel monthly, costing over RM 65,000 to RM 72,000 in fuel alone.",
                "Equipment Rental Overhead: Hiring 300 to 500 kVA generators adds RM 15,000 to RM 35,000 monthly in rental and maintenance invoices."
            ]),
            ("Noise & Manual Reporting", [
                "82.0 dBA Continuous Drone: Generators run non-stop at 82 decibels, penetrating neighbouring homes and breaching DOE Schedule 6 limits (60 dBA Day / 45 dBA Night).",
                "Statutory Stop-Work Exposure: Triggers resident complaints, local council inspections, and up to RM 100,000 fines under Environmental Quality Act 1974.",
                "Field Evidence from Inta Bina: Environmental officers track compliance using manual Word, Excel, and WhatsApp photos. Missing data and lost logs delay mandatory reporting.",
                "The Tower Crane Surge Trap: Sites rent massive 500 kVA generators solely to buffer momentary 94 kW crane motor inrush, leaving generators idling at 15-20% load overnight and wasting 70% of fuel."
            ])
        ],
        speaker_note="Active construction parcels face a four-part problem. First, civil works take up to 18 months before TNB substations can be commissioned. Second, because commercial construction is excluded from BUDI Madani subsidies, sites pay RM 5.17 per litre for diesel, draining RM 100,000 to RM 125,000 every month in fuel and rental fees. Third, continuous 82 dBA generator noise violates DOE Schedule 6 limits and causes residential complaints that risk stop-work orders. And fourth, our direct interviews with Inta Bina confirmed that environmental compliance tracking is 100% manual, with officers losing hours chasing missing Excel sheets."
    )

    # =========================================================================
    # SLIDE 3: 2. Target User (The Story)
    # =========================================================================
    add_standard_slide(
        title_text="2. Target User",
        category_text="The Story : Area 2",
        bullet_sections=[
            ("1. Site M&E Manager", [
                "Role: Mechanical & Electrical site engineer (such as Inta Bina M&E leads).",
                "Daily Reality: Powers heavy machinery (tower cranes, hoists, pumps, worker quarters).",
                "Frustration: 94 kW motor startup surges trip main breakers mid-pour; constant midnight callouts to restart failed generators; managing diesel logistics and fuel theft."
            ]),
            ("2. Environmental Officer", [
                "Role: Licensed site Environmental Officer (such as Puan Nurul at Inta Bina).",
                "Daily Reality: Legally accountable for Department of Environment (DOE) compliance.",
                "Frustration: Buried under manual Word and Excel checklists; chasing supervisors for missing site inspection photos; anxiety over 82 dBA generator noise fines."
            ]),
            ("3. Sime Darby HQ Leadership", [
                "Role: Township Project Directors & Group Sustainability Officers.",
                "Daily Reality: Overseeing master township budgets and corporate Net Zero targets.",
                "Frustration: Absorbing RM 100k-125k/mo cash drain per parcel in prelims; zero cross-site visibility; slow compilation of Scope 1 carbon data for Bursa Malaysia."
            ]),
            ("4. Township Residents", [
                "Role: Families in completed residential phases living next to active parcels.",
                "Daily Reality: Living within tens of metres of active construction hoardings.",
                "Frustration: Enduring non-stop 82 dBA generator rumble disturbing sleep; breathing diesel exhaust; filing complaints to town councils (MBSA, MP Sepang)."
            ])
        ],
        speaker_note="The temporary power problem directly affects four distinct groups. On the ground, the Site M&E Manager battles breaker trips caused by 94 kW tower crane motor surges and endless diesel delivery logistics. Next, the Site Environmental Officer: our field research with Inta Bina revealed that officers are buried in manual paper and Excel reporting, losing hours chasing missing site photos while constantly fearing 82 dBA generator noise penalties. At headquarters, Sime Darby Property leadership loses over RM 100,000 every month per parcel in preliminary expenses while struggling to compile verified Scope 1 carbon data for Bursa Malaysia. Finally, neighbouring township residents endure continuous engine roar and diesel fumes right outside their windows, leading to formal complaints that threaten the developer's reputation."
    )

    # =========================================================================
    # SLIDE 4: 3. Solution (The Story)
    # =========================================================================
    add_standard_slide(
        title_text="3. Solution",
        category_text="The Story : Area 3",
        bullet_sections=[
            ("Clean Hardware Foundation", [
                "522 kWh Containerised LFP Battery: Mobile 20-ft container (MegaBatt BESS) deployed directly at the site main switchboard, providing high-capacity clean storage.",
                "40 kWp On-Site Solar Array: Bifacial solar panels mounted on site office roofs and perimeter acoustic hoarding to capture clean renewable generation.",
                "Eliminates 500 kVA Generators: Replaces rented generators completely, or downsizes them to a tiny 150 kVA backup that stays shut off for over 80% of operating hours."
            ]),
            ("SiteOS Orchestration Software", [
                "Closed-Loop Power Control: Dispatches energy between solar, battery storage, and site equipment every 5 seconds using Model Predictive Control (MPC).",
                "Sub-4ms Inrush Buffering: Inverter IGBT switches absorb 94 kW crane motor startup spikes in under 4 milliseconds, keeping bus voltage stable at 400V with zero breaker trips.",
                "Purpose-Built Role Tools: M&E live machinery console, Environmental Officer 1-click statutory DOE EMP report export, and HQ cross-site executive dashboard.",
                "Commercial Shift: High initial Capex, but 14.2-month payback. Converts disposable monthly rental burn into a reusable 10-year township asset."
            ])
        ],
        speaker_note="Our solution is GreenPulse SiteOS: the zero-genset site energy operating system. We combine a 522 kWh containerised Lithium Iron Phosphate battery with a 40 kWp solar array on site cabins and a smart edge gateway. But hardware alone is not enough; without intelligent coordination, heavy machinery trips the system. SiteOS acts as the operational brain: it absorbs massive 94 kW tower crane motor surges in under 4 milliseconds, balances solar charging, and keeps diesel generators turned off. Furthermore, SiteOS provides tailored software tools for each role: an operational telemetry console for the M&E manager, automated 1-click DOE compliance reporting for the environmental officer to replace manual Excel, and a multi-site portfolio dashboard for Sime Darby Property HQ."
    )

    # =========================================================================
    # SLIDE 5: 4. Innovation (The Story)
    # =========================================================================
    add_standard_slide(
        title_text="4. Innovation",
        category_text="The Story : Area 4",
        bullet_sections=[
            ("1. SurgeGuard Sub-4ms Buffer", [
                "The Physics Barrier: 45 kW crane draws 94 kW inductive surge for 1.8 seconds. Standard mechanical governors take 150-300ms to react, dropping voltage to 320V and tripping breakers.",
                "The Breakthrough: Inverter IGBT switches respond in under 3.8 milliseconds with DC-bus capacitance buffer.",
                "The Outcome: Stabilises line voltage at 400V (+/-1.5%), guaranteeing zero breaker trips during heavy concrete lifts."
            ]),
            ("2. SolarCast Tropical Weather ML", [
                "The Weather Barrier: Tropical thunderstorms cause solar generation to collapse from 145 kW to 22 kW in 10 minutes, forcing sudden diesel generator starts.",
                "The Breakthrough: Pairs MET Malaysia Doppler radar (10-min scans) with solar geometry models to predict storms 4 hours ahead.",
                "The Outcome: Automatically pre-charges battery to 88% so the site powers through rain with zero diesel burned."
            ]),
            ("3. EchoShield Acoustic AI", [
                "The Acoustic Barrier: Passing 10-tonne diesel trucks on public roads spike boundary sound meters above 71 dBA, causing false DOE violation notices.",
                "The Breakthrough: Edge audio ML separates external highway truck rumble from internal site construction machinery.",
                "The Outcome: Proves true boundary noise is 54.1 dBA and generates 1-click statutory DOE EMP PDF reports automatically."
            ])
        ],
        speaker_note="What makes GreenPulse genuinely innovative rather than just another solar dashboard? Three proprietary engineering breakthroughs. First, SurgeGuard: ordinary battery setups cannot handle the violent 94 kW motor startup kick from a tower crane without tripping breakers. Our high-speed inverter controls respond in under 3.8 milliseconds, buffering the surge and keeping line voltage rock-solid. Second, SolarCast ML: tropical Malaysian downpours can wipe out 80% of solar generation in minutes. By integrating MET Malaysia radar data, our system predicts storms 4 hours ahead and pre-charges the battery so construction continues uninterrupted without burning diesel. Third, EchoShield Acoustic AI: our edge sound algorithm isolates passing road traffic from genuine site machinery, proving compliance with DOE Schedule 6 at 54.1 dBA and generating 1-click statutory compliance reports that liberate environmental officers from manual Excel spreadsheets."
    )

    # =========================================================================
    # SLIDE 6: 5. How it Works (The Proof)
    # =========================================================================
    add_standard_slide(
        title_text="5. How it Works",
        category_text="The Proof : Area 5",
        bullet_sections=[
            ("Step 1 & 2: Sensors & IoT", [
                "Step 1: Industrial Edge Telemetry (100ms Polling): Smart meters, inverter gateways, and Class 1 microphones continuously measure 3-phase AC voltage, current, inverter frequency, battery SoC, and boundary sound.",
                "Step 2: Encrypted 4G LTE IoT Pipeline: An industrial edge gateway packages data into encrypted MQTT packets, streaming live telemetry directly to the GreenPulse cloud data engine."
            ]),
            ("Step 3 & 4: AI & Web App", [
                "Step 3: MPC Dispatch Optimization (Every 5 Sec): Cloud engine calculates the optimal power flow vector based on solar output, crane duty cycles, and radar forecasts. Commands inverter to buffer surges and keep generator off.",
                "Step 4: Role-Conditioned Web Application: Live telemetry powers three dedicated interfaces: M&E equipment load console (/me), Environmental Officer 1-click DOE reporting (/eo), and HQ executive portfolio dashboard (/hq)."
            ])
        ],
        speaker_note="Here is how GreenPulse works under the hood. Industrial IoT sensors capture voltage, current, battery state of charge, and boundary sound levels every 100 milliseconds. This data streams via encrypted 4G to our cloud engine, where Model Predictive Control solves the optimal power dispatch equation every 5 seconds. Commands execute instantly at the site inverter to buffer crane surges and maximise solar self-consumption. Simultaneously, our live web application serves role-specific tools: live machinery telemetry for the M&E engineer, 1-click DOE compliance exports for the environmental officer, and macro-level township oversight for HQ executives."
    )

    # =========================================================================
    # SLIDE 7: 6. Impact (The Proof)
    # =========================================================================
    add_standard_slide(
        title_text="6. Impact",
        category_text="The Proof : Area 6",
        bullet_sections=[
            ("Financial Impact", [
                "Fuel Expense Saved: Avoids 18,400 litres of Euro 5 diesel monthly (18,400L x RM 5.17/L = RM 95,128 / month saved).",
                "Rental Invoices Cancelled: Eliminates two rented 500 kVA generators (RM 30,000 / month saved).",
                "Net Monthly Cash Savings: RM 125,128 net operational savings per active parcel.",
                "6-Month Structural Phase: RM 750,768 in direct cash saved per construction parcel."
            ]),
            ("Decarbonisation & ESG", [
                "77.6% Direct Scope 1 Cut: Abates 49.3 tonnes of CO2e every month per active parcel (2.68 kg CO2e / L factor).",
                "18-Month Construction Cycle: 887.4 tonnes of CO2e eliminated per project.",
                "Bursa Malaysia Compliance: Lowers construction carbon intensity from 18.40 down to 4.12 kg CO2e / m2 CFA, providing verified audit logs for ESG disclosures."
            ]),
            ("Acoustic Harmony", [
                "27.9 dBA Noise Attenuation: Reduces boundary sound from 82.0 dBA down to 54.1 dBA (an 88% drop in perceived loudness).",
                "100% DOE Schedule 6 Compliant: Fully complies with daytime (60 dBA) and nighttime (45 dBA) residential limits.",
                "Zero Stop-Work Exposure: Eliminates resident noise complaints and protects Sime Darby Property's corporate reputation."
            ])
        ],
        speaker_note="The impact of GreenPulse SiteOS is immediate, quantifiable, and transformative. Financially, we eliminate RM 95,000 in monthly diesel invoices and RM 30,000 in generator rental fees, delivering over RM 125,000 in net monthly cash savings per active parcel. Environmentally, we cut 49.3 tonnes of Scope 1 CO2 every single month, representing an audited 77.6% carbon reduction that feeds directly into Bursa Malaysia ESG disclosures. Acoustically, site noise drops by 27.9 decibels, allowing quiet, compliant coexistence with surrounding residential neighbourhoods."
    )

    # =========================================================================
    # SLIDE 8: 7. Feasibility (The Proof)
    # =========================================================================
    add_standard_slide(
        title_text="7. Feasibility",
        category_text="The Proof : Area 7",
        bullet_sections=[
            ("Commercial Unit Economics", [
                "Capex per System: 522 kWh / 400 kW Inverter BESS Container (RM 1.45M) + 40 kWp Solar PV (RM 240k) + IoT Gateway & Switchboard Integration (RM 80k) = RM 1,770,000 Total Capex.",
                "Annual Operational Savings: RM 1,501,536 / year (RM 125,128/mo x 12).",
                "Capital Payback Period: 14.2 Months (1.18 years).",
                "Key Commercial Milestones: The system pays for itself before the 18-month civil construction phase ends, leaving years of clean operational profit."
            ]),
            ("Technical Bankability & Safety", [
                "Tier-1 LFP Chemistry: CATL / EVE automotive-grade Lithium Iron Phosphate cells rated for 6,000 cycles to 80% State of Health (16+ year operational lifespan).",
                "Bomba & Fire Safety: Integrated aerosol FM-200 / Novec clean agent fire suppression compliant with NFPA 855 standards and Jabatan Bomba guidelines.",
                "Transport & Logistics: Standard 20-foot ISO container footprint with twist-lock corners, fully transportable on standard Malaysian low-loader trailers between townships."
            ])
        ],
        speaker_note="Is GreenPulse commercially and technically feasible? Absolutely. At RM 1.77 Million Capex for a complete 522 kWh system, annual operating savings of RM 1.5 Million deliver a rapid 14.2-month capital payback. The system pays for itself before the 18-month civil construction phase even ends. Technically, we specify tier-1 CATL Lithium Iron Phosphate cells rated for 6,000 cycles with NFPA 855 fire suppression, built into a standard 20-foot container that moves effortlessly on standard low-loader trailers between townships."
    )

    # =========================================================================
    # SLIDE 9: 8. Implementation (The Proof)
    # =========================================================================
    add_standard_slide(
        title_text="8. Implementation",
        category_text="The Proof : Area 8",
        bullet_sections=[
            ("12-Week Pilot Roadmap", [
                "Phase 1: Pilot Validation (Weeks 1-4) at City of Elmina: Deploy 522 kWh unit at Kanopi Residences; train Inta Bina site engineering team; validate sub-4ms motor inrush absorption; calibrate MBSA acoustic baseline.",
                "Phase 2: Twin Township Expansion (Weeks 5-8) at Serenia City: Deploy at Serenia Aqila; integrate automated 1-click DOE EMP compliance export; launch HQ central portfolio monitoring.",
                "Phase 3: Multi-Site Fleet Deployment (Weeks 9-12) at Bandar Bukit Raja: Scale across industrial logistics parcels; establish standardized Green Tender specifications for all main contractors."
            ]),
            ("10-Year Township Asset Moat", [
                "Moving Capital Asset: Unlike disposable rental generators, modular BESS containers move sequentially across township phases for 10 years (over 3,500 battery cycles).",
                "Deployment Sequence: Years 1-2 at Putra Heights -> Years 3-5 at City of Elmina -> Years 6-10 at Bandar Bukit Raja.",
                "10-Year Cumulative Value: RM 9,840,000 in net savings generated by a single BESS container across its operational lifespan."
            ])
        ],
        speaker_note="Our implementation roadmap is clear and phased. Phase 1 launches a 4-week pilot at City of Elmina to validate motor inrush and acoustic baseline. Phase 2 expands to Serenia City with automated DOE compliance. Phase 3 scales across Bandar Bukit Raja's industrial developments. Crucially, this is a reusable 10-year asset: each container moves from parcel to parcel across successive projects, generating nearly RM 10 Million in cumulative lifetime value for Sime Darby Property."
    )

    # =========================================================================
    # SLIDE 10: Conclusion & The Ask
    # =========================================================================
    add_standard_slide(
        title_text="Conclusion & The Ask",
        category_text="Conclusion : Leading Malaysia's Net Zero Construction Vision",
        bullet_sections=[
            ("The 3 Asks to Leadership", [
                "1. Pilot Parcel Endorsement: Authorise a 6-month pilot deployment at City of Elmina (Kanopi Residences) to validate real-world operational and acoustic performance.",
                "2. Contractor Switchboard Access: Partner with site engineering teams (such as Inta Bina) to mount IoT telemetry gateways on the site main switchboard.",
                "3. Green Tender Mandate: Incorporate GreenPulse SiteOS as the designated clean temporary power benchmark in 2027 main contractor development tenders."
            ]),
            ("Why GreenPulse Wins", [
                "Strictly Solves a Validated Problem: Built on real grid delays, unsubsidised diesel prices (RM 5.17/L), and statutory DOE noise limits.",
                "Designed for Real Humans: Directly solves daily headaches for the Site M&E Manager, Environmental Officer, HQ Leadership, and Township Residents.",
                "Production-Ready Prototype: Web platform, real-time telemetry engine, and automated compliance tools are fully functional today.",
                "Closing Vision: Building the Townships of Tomorrow with clean, zero-genset power today."
            ])
        ],
        speaker_note="GreenPulse proves that construction decarbonisation is not an expensive luxury; it is a cash-generating operational advantage. Our prototype, telemetry models, and business cases are fully functional today. We invite Sime Darby Property leadership to partner with us on the City of Elmina pilot. Thank you."
    )

    output_path = os.path.abspath("GreenPulse_Pitch_Deck.pptx")
    prs.save(output_path)
    print(f"Clean content PPTX successfully saved to: {output_path}")

if __name__ == "__main__":
    build_content_deck()
