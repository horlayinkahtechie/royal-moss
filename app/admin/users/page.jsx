import Users from "./users";

export const metadata = {
  title: "Admin Users – Hotel Management",
  description:
    "Admin page for managing user accounts of Royal Moss Hotel. Restricted access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Page() {
  return (
    <div>
      <Users />
    </div>
  );
}
