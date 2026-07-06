import { Activity, CheckCircle, Clock, DollarSign } from "lucide-react";

export default function StatsCards({ routes }) {

    const total = routes.length;

    const active = routes.filter(
        r => r.status === "active"
    ).length;

    const completed = routes.filter(
        r => r.status === "completed"
    ).length;

    const totalCost = routes.reduce(
    (sum, r) => sum + (r.cost_incurred || 0),
    0
);

    const cards = [
        {
            title: "Total Routes",
            value: total,
            icon: Activity,
            color: "#3b82f6"
        },
        {
            title: "Active",
            value: active,
            icon: Clock,
            color: "#f59e0b"
        },
        {
            title: "Completed",
            value: completed,
            icon: CheckCircle,
            color: "#22c55e"
        },
        {
            title: "Cost Saved",
            value: `₹${totalCost}`,
            icon: DollarSign,
            color: "#a855f7"
        }
    ];

    return (
        <div className="stats-section">

            {cards.map((card, i) => {

                const Icon = card.icon;

                return (
                    <div
                        key={i}
                        className="stat-card"
                    >

                        <Icon
                            size={28}
                            style={{ color: card.color }}
                        />

                        <h2>{card.value}</h2>

                        <p>{card.title}</p>

                    </div>
                );
            })}

        </div>
    );
}