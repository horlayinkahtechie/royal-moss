import Bookings from "./bookings";

export const metadata = {
  title: "Bookings | Admin – Royal Moss Hotel",
  description:
    "Admin bookings management dashboard for Royal Moss Hotel. View, manage, and update all room reservations. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Bookings />
    </div>
  );
}
