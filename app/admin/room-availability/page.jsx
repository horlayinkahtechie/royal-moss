import AdminBookRoom from "../book-a-room/bookroom";

export const metadata = {
  title: "Admin Book a Room – Hotel Management",
  description: "Admin page for creating room bookings on behalf of guests.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <AdminBookRoom />
    </div>
  );
}
