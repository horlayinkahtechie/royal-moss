import Analytics from "./analytics";

export const metadata = {
  title: "Analytics Dashboard | Admin – Royal Moss Hotel",
  description:
    "Admin analytics dashboard for Royal Moss Hotel. View bookings, revenue, and performance metrics. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Analytics />
    </div>
  );
}
