import Rooms from "./rooms";

export const metadata = {
  title: "Admin Rooms – Hotel Management",
  description:
    "Admin page for managing hotel rooms, including adding, editing, and deleting room listings.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Rooms />
    </div>
  );
}
