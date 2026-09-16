import React from "react";
import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import "./StatCard.css";


const StatCard = ({
  label,
  value,
  change,
  description,
  icon: Icon,
  variant = "orange",
  changeType = "up",
}) => {

  const ChangeIcon =
    changeType === "up"
      ? TrendingUp
      : TrendingDown;


  return (
    <article className="tx-stat-card">

      <div className="tx-stat-card-header">

        <span className="tx-stat-label">
          {label}
        </span>


        <div
          className={`tx-stat-icon tx-stat-${variant}`}
        >
          {Icon && (
            <Icon size={17} />
          )}
        </div>

      </div>


      <div className="tx-stat-value">
        {value}
      </div>


      <div className="tx-stat-footer">

        <span
          className={`tx-stat-change tx-change-${changeType}`}
        >

          <ChangeIcon size={11} />

          {change}

        </span>


        <span className="tx-stat-description">
          {description}
        </span>

      </div>

    </article>
  );
};


export default StatCard;