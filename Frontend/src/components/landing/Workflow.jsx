import { motion } from "framer-motion";
import "./workflow.css";
import {
  Satellite,
  Database,
  BrainCircuit,
  Search,
  FileCheck2,
  ArrowRight,
} from "lucide-react";


const workflowSteps = [
  {
    number: "01",
    icon: Satellite,
    title: "COLLECT",
    description:
      "Satellite thermal observations and open geospatial data are gathered for the area of interest.",
  },

  {
    number: "02",
    icon: Database,
    title: "PROCESS",
    description:
      "Raw observations are cleaned, validated and enriched with relevant contextual information.",
  },

  {
    number: "03",
    icon: BrainCircuit,
    title: "ANALYZE",
    description:
      "AI models analyze thermal patterns, persistence and supporting evidence.",
  },

  {
    number: "04",
    icon: Search,
    title: "INVESTIGATE",
    description:
      "Events are investigated using geospatial context, evidence fusion and risk indicators.",
  },

  {
    number: "05",
    icon: FileCheck2,
    title: "REPORT",
    description:
      "Validated intelligence is organized into actionable event profiles and investigation reports.",
  },
];


function Workflow() {
  return (
    <section
      id="workflow"
      className="workflow-section"
    >

      <div className="workflow-container">

        {/* ------------------------------------------------
            SECTION HEADER
        ------------------------------------------------ */}

        <motion.div
          className="workflow-header"

          initial={{
            opacity: 0,
            y: 25,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          viewport={{
            once: true,
            amount: 0.3,
          }}

          transition={{
            duration: 0.7,
          }}
        >

          <div className="workflow-eyebrow">
            OUR WORKFLOW
          </div>

          <h2 className="workflow-title">
            From Observation
            <br />
            <span>to Action.</span>
          </h2>

          <p className="workflow-intro">
            A complete intelligence pipeline for
            thermal event detection, analysis and
            investigation.
          </p>

        </motion.div>


        {/* ------------------------------------------------
            WORKFLOW PIPELINE
        ------------------------------------------------ */}

        <div className="workflow-pipeline">

          {workflowSteps.map(
            (step, index) => {

              const Icon =
                step.icon;

              return (
                <motion.div
                  className="workflow-item"
                  key={step.number}

                  initial={{
                    opacity: 0,
                    y: 25,
                  }}

                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}

                  viewport={{
                    once: true,
                    amount: 0.25,
                  }}

                  transition={{
                    duration: 0.6,
                    delay:
                      index * 0.1,
                  }}
                >

                  {/* NUMBER */}

                  <div className="workflow-number">
                    {step.number}
                  </div>


                  {/* ICON */}

                  <div className="workflow-icon">
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>


                  {/* CONTENT */}

                  <div className="workflow-content">

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.description}
                    </p>

                  </div>


                  {/* CONNECTOR */}

                  {index <
                    workflowSteps.length - 1 && (
                    <div className="workflow-connector">

                      <ArrowRight
                        size={18}
                        strokeWidth={1.5}
                      />

                    </div>
                  )}

                </motion.div>
              );
            }
          )}

        </div>


        {/* ------------------------------------------------
            BOTTOM STATEMENT
        ------------------------------------------------ */}

        <motion.div
          className="workflow-statement"

          initial={{
            opacity: 0,
            y: 20,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          viewport={{
            once: true,
            amount: 0.3,
          }}

          transition={{
            duration: 0.7,
          }}
        >

          <span className="statement-line" />

          <p>
            Observe the signal.
            Understand the pattern.
            Act with intelligence.
          </p>

          <span className="statement-line" />

        </motion.div>

      </div>

    </section>
  );
}


export default Workflow;