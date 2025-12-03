import React from 'react';

interface ReputationBadgeProps {
    score: number;
    level: string;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({ score, level }) => {
    const getColor = () => {
        if (score >= 90) return '#805ad5'; // Purple for Elite
        if (score >= 70) return '#38a169'; // Green for Good
        if (score >= 50) return '#3182ce'; // Blue for Mid
        return '#718096'; // Gray for New
    };

    const color = getColor();

    return (
        <div className="reputation-badge" title={`Reputation Score: ${score}/100`}>
            <div className="score-ring">
                <span className="score-text">{score}</span>
            </div>
            <span className="level-text">{level}</span>

            <style jsx>{`
        .reputation-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          padding: 4px 12px 4px 4px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          font-family: 'Inter', sans-serif;
        }

        .score-ring {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        }

        .level-text {
          font-size: 12px;
          font-weight: 600;
          color: ${color};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
        </div>
    );
};
