import React from 'react';
import { useNavigate } from 'react-router-dom';

const VitalSignsAboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="vs-page">
      {/* Hero */}
      <section className="vs-page-hero">
        <div className="vs-container">
          <div className="vs-eyebrow">— ABOUT THE PLATFORM</div>
          <div className="vs-spacer-sm" />
          <h1 className="vs-page-title">
            A platform for<br />
            <em className="vs-italic vs-coral">authentic</em> health<br />
            storytelling<span className="vs-period">.</span>
          </h1>
          <p className="vs-lead">
            Vital Signs is a literary archive of first-person health experiences —
            curated, edited, and held with care. Founded at the University of Toronto
            in partnership with the people who lived these stories first.
          </p>
        </div>
      </section>

      {/* Editorial rows */}
      <section>
        <div className="vs-container">
          <div className="vs-about-row">
            <h2>Why this exists.</h2>
            <div>
              <p>
                Health experiences shape who we are, yet most people face them alone.
                The doctor's visit is fifteen minutes. The recovery is months. The aftermath
                is the rest of a life. None of it has anywhere to go.
              </p>
              <p>
                Vital Signs is a place to put it down. To be read by others who needed
                to read exactly that. To stop carrying the heavy parts in private.
              </p>
            </div>
          </div>

          <div className="vs-about-row">
            <h2>How it works.</h2>
            <div>
              <p>
                <strong>01 — Write.</strong> You share a story at whatever length and detail
                feels right. Anonymously, or with your name attached.
              </p>
              <p>
                <strong>02 — We review.</strong> A small editorial team reads every submission
                for safety and clarity. We never change tone or voice — only suggest cuts where
                a sentence isn't doing its job.
              </p>
              <p>
                <strong>03 — It's published.</strong> Your story lives in the archive, searchable
                by topic. Readers can mark it as resonating with their own experience — a small
                signal that you helped someone feel less alone.
              </p>
            </div>
          </div>

          <div className="vs-about-row">
            <h2>What we won't do.</h2>
            <div>
              <p>
                We don't run advertising. We don't sell data. We don't push notifications,
                surface engagement metrics, or measure what makes you scroll. Readers don't
                comment publicly on your story — the platform is built for reading, not reacting.
              </p>
              <p>
                We don't moderate experience. We moderate safety. If something hurtful or unsafe
                slips in, it comes down. Everything else — the messy, contradictory, human stuff —
                stays exactly as you wrote it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sand callout */}
      <section className="vs-about-quote">
        <div className="vs-container">
          <p className="vs-about-quote-text">
            The body keeps the score. We keep the writing.
          </p>
          <div style={{
            marginTop: 32,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--vs-ink-muted)',
          }}>
            — From the founding editor's note
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vs-section">
        <div className="vs-container">
          <div className="vs-section-number">
            <span className="num">04</span>— YOUR STORY
          </div>
          <div className="vs-grid-asym" style={{ marginTop: 32 }}>
            <h2 className="vs-section-title">
              Ready when you <em className="vs-italic vs-coral">are</em><span className="vs-period">.</span>
            </h2>
            <div>
              <p className="vs-lead" style={{ marginBottom: 32 }}>
                There's no minimum length. No required vulnerability. Write what you'd
                want to read.
              </p>
              <button
                className="vs-btn vs-btn--primary vs-btn--large"
                onClick={() => navigate('/submit')}
              >
                <span className="vs-btn-dot" />
                Share your story
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VitalSignsAboutPage;
