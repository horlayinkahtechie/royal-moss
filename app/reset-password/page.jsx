import ResetPassword from "./resetPassword";

export const metadata = {
  title: "Reset Password | Royal Moss Hotel",
  description:
    "Reset your Royal Moss Hotel account password securely and regain access to your bookings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div>
      <ResetPassword />
    </div>
  );
}
