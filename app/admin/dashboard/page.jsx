import Dashboard from "./dashboard";

export const metadata = {
  title: "Admin Dashboard – Royal Moss Hotel",
  description:
    "Admin dashboard for managing bookings, rooms, customers, and analytics. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}
