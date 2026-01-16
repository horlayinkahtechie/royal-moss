import Customers from "./customers";

export const metadata = {
  title: "Customers | Admin – Royal Moss Hotel",
  description:
    "Admin customers management dashboard for Royal Moss Hotel. View customer profiles, booking history, and insights. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Customers />
    </div>
  );
}
