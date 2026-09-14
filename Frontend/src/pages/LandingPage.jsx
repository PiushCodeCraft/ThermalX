import Navbar from "../components/landing/Navbar";
import Workflow from "../components/landing/Workflow";
import Footer from "../components/common/Footer";
import "./LandingPage.css";

function LandingPage() {
  return (
    <main className="landing-page">

      {/* =================================================
          HERO SECTION
          ================================================= */}

      <section
        id="home"
        className="hero-section"
      >

        {/* Earth / Space Video */}

        <video
          className="hero-space-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="/earth-space.mp4"
            type="video/mp4"
          />

          Your browser does not support video playback.
        </video>


        {/* Video Overlay */}

        <div className="hero-video-blend" />


        {/* Constant Header */}

        <Navbar />


        {/* Hero Content */}

        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-eyebrow">
              SATELLITE INTELLIGENCE FOR A SAFER PLANET
            </div>


            <h1 className="hero-title">

              <span className="hero-line">
                SEE THE{" "}
                <span className="heat-word">
                  HEAT.
                </span>
              </span>

              <span className="hero-line">
                UNDERSTAND
              </span>

              <span className="hero-line">
                THE CHANGE.
              </span>

            </h1>


            <p className="hero-description">
              THERMAL X combines satellite thermal observations,
              geospatial intelligence, persistence analysis and
              AI-powered evidence fusion to detect, classify and
              investigate significant thermal events.
            </p>


            <div className="hero-technical-line">

              <span>
                THERMAL OBSERVATION
              </span>

              <span className="technical-separator">
                /
              </span>

              <span>
                GEOSPATIAL INTELLIGENCE
              </span>

              <span className="technical-separator">
                /
              </span>

              <span>
                AI ANALYSIS
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          WORKFLOW SECTION
          ================================================= */}

      {/* <Workflow /> */}
      <Footer />
    </main>
  );
}

export default LandingPage;