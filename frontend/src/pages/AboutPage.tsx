import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="ab-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="vs-eyebrow">— ABOUT THE PLATFORM</div>
            <h1 className="ab-title">
              A platform for<br />
              <em className="vs-italic vs-coral">authentic</em> health<br />
              storytelling<span className="vs-period">.</span>
            </h1>
            <p className="vs-lead">
              Vital Signs is a literary archive of first-person health experiences —
              curated, edited, and held with care. Founded at the University of Toronto
              in partnership with the people who lived these stories first.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Editorial rows */}
      <section className="ab-rows">
        <div className="container">
          <div className="ab-row">
            <h2>Why this exists<span className="vs-period">.</span></h2>
            <div>
              <p>
                Health experiences shape who we are, yet most people face them alone.
                The doctor’s visit is fifteen minutes. The recovery is months. The
                aftermath is the rest of a life. None of it has anywhere to go.
              </p>
              <p>
                Vital Signs is a place to put it down. To be read by others who needed
                to read exactly that. To stop carrying the heavy parts in private.
              </p>
            </div>
          </div>

          <div className="ab-row">
            <h2>How it works.</h2>
            <div>
              <p>
                <strong>01 — Write.</strong> You share a story at whatever length
                and detail feels right. Anonymously, or with your name attached.
              </p>
              <p>
                <strong>02 — We review.</strong> A small editorial team reads every
                submission for safety and clarity. We never change tone or voice —
                only suggest cuts where a sentence isn’t doing its job.
              </p>
              <p>
                <strong>03 — It’s published.</strong> Your story lives in the archive,
                searchable by topic. Readers can mark it as resonating with their own
                experience — a small signal that you helped someone feel less alone.
              </p>
            </div>
          </div>

          <div className="ab-row">
            <h2>What we won’t do.</h2>
            <div>
              <p>
                We don’t run advertising. We don’t sell data. We don’t push notifications,
                surface engagement metrics, or measure what makes you scroll. Readers don’t
                comment publicly on your story — the platform is built for reading, not reacting.
              </p>
              <p>
                We don’t moderate experience. We moderate safety. If something hurtful or
                unsafe slips in, it comes down. Everything else — the messy, contradictory,
                human stuff — stays exactly as you wrote it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sand callout */}
      <section className="ab-quote">
        <div className="container">
          <p className="ab-quote-text">
            The body keeps the score. We keep the writing.
          </p>
          <div className="ab-quote-attr">— From the founding editor’s note</div>
        </div>
      </section>

      {/* CTA */}
      <section className="section ab-cta">
        <div className="container">
          <div className="vs-section-number"><span className="num">04</span>— YOUR STORY</div>
          <div className="vs-grid-asym ab-cta-grid">
            <h2 className="ab-cta-title">
              Ready when you <em className="vs-italic vs-coral">are</em><span className="vs-period">.</span>
            </h2>
            <div>
              <p className="vs-lead" style={{ marginBottom: 32 }}>
                There’s no minimum length. No required vulnerability. Write what
                you’d want to read.
              </p>
              <Link to="/submit" className="btn btn-primary btn-lg">Share your story</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .about-page { min-height: 100vh; background: var(--vs-ivory); }

        .ab-hero { padding: 96px 0 64px; }
        .ab-title {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-weight: 600;
          font-size: clamp(44px, 5.5vw, 80px);
          line-height: 1.02;
          letter-spacing: -0.03em;
          color: var(--vs-ink);
          margin: 24px 0 32px;
        }

        .ab-rows { padding: 32px 0 96px; }
        .ab-row {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 96px;
          padding: 80px 0;
          border-top: 1px solid var(--vs-rule);
        }
        .ab-row:last-of-type { border-bottom: 1px solid var(--vs-rule); }
        .ab-row h2 {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-weight: 500;
          font-size: clamp(28px, 2.8vw, 40px);
          line-height: 1.08;
          letter-spacing: -0.018em;
          color: var(--vs-ink);
          margin: 0;
        }
        .ab-row p {
          font-family: var(--vs-font-sans);
          font-size: 17px;
          line-height: 1.7;
          color: var(--vs-ink-muted);
          margin: 0 0 20px;
          max-width: 56ch;
        }
        .ab-row strong {
          color: var(--vs-ink);
          font-weight: 600;
        }

        .ab-quote {
          padding: 128px 0;
          background: var(--vs-sand);
        }
        .ab-quote-text {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-style: italic;
          font-weight: 500;
          font-size: clamp(28px, 3.4vw, 48px);
          line-height: 1.18;
          letter-spacing: -0.012em;
          color: var(--vs-ink);
          max-width: 28ch;
          margin: 0;
        }
        .ab-quote-text::before {
          content: "\\201C";
          color: var(--vs-coral);
          margin-right: 8px;
          font-style: normal;
        }
        .ab-quote-attr {
          margin-top: 32px;
          font-family: var(--vs-font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--vs-ink-muted);
        }

        .ab-cta-grid { margin-top: 32px; }
        .ab-cta-title {
          font-family: var(--vs-font-serif);
          font-feature-settings: "liga", "dlig", "kern";
          font-weight: 600;
          font-size: clamp(36px, 4.2vw, 64px);
          line-height: 1.04;
          letter-spacing: -0.022em;
          color: var(--vs-ink);
          margin: 0;
        }

        @media (max-width: 900px) {
          .ab-hero { padding: 56px 0 32px; }
          .ab-row { grid-template-columns: 1fr; gap: 32px; padding: 56px 0; }
          .ab-quote { padding: 80px 0; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
