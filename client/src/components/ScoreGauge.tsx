import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ScoreGauge({ score }: { score: number }) {
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  let color = "#3b82f6"; // blue-500
  if (score >= 80) color = "#10b981"; // emerald-500
  if (score < 50) color = "#f59e0b"; // amber-500
  if (score < 30) color = "#ef4444"; // red-500

  return (
    <div className="relative h-24 w-24 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={40}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} stroke="none" />
            <Cell fill="#e2e8f0" stroke="none" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-center">
        <span className="text-xl font-bold font-display" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Score</span>
      </div>
    </div>
  );
}
