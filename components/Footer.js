export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#eadfd9] bg-[#fff1ea] rounded-t-4xl">
      <div className="mx-auto grid w-full max-w-300 gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-3 lg:px-8">
        <div>
          <div className="text-xl font-extrabold text-[#a73a05]">
            Tawa &amp; Taste
          </div>
          <p className="mt-2 text-sm text-[#58423a]">
            From Our Tawa to Your Table
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-[#181c20]">Opening Hours</h3>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Mon–Sun
            <br />
            11:00 AM – 11:00 PM
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-[#181c20]">Visit Us</h3>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            Tawa &amp; Taste Restaurant
            <br />
            Dhaka, Bangladesh
          </p>
        </div>
      </div>

      <div className="border-t border-[#eee7e3] ">
        <div className="mx-auto flex w-full max-w-300 flex-col gap-3 px-4 py-5 text-xs text-[#6b7280] sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex gap-4">
            <span>Privacy &amp; Policy</span>
            <span>Terms &amp; Condition</span>
          </div>
          <span>
            © {new Date().getFullYear()} Tawa &amp; Taste. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
