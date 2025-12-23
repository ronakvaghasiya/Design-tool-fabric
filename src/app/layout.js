export const metadata = {
  title: "Design Tool"
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"
          defer
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
