import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ConductCertificate = ({
  serialNo,
  date,
  studentName,
  parentName,
  course,
  fromYear,
  toYear,
  logoPath = "D:/ecerti/frontend/public/MGU_LOGO.png",
  principalSign = "/assets/principal_sign.png",
  bg = "/assets/template_bg.png",
}) => {
  const certRef = useRef();

  const downloadPDF = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, {
      scale: 4,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save(`${studentName || "student"}_ConductCertificate.pdf`);
  };

  return (
    <div className="flex flex-col items-center w-full mt-4">
      {/* Certificate Container */}
      <div
        ref={certRef}
        className="relative w-[800px] min-h-[1100px] bg-white p-10 border border-gray-300"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
        }}
      >
        {/* Left Border */}
        <div className="absolute top-0 left-0 w-6 h-full border-r border-gray-500"></div>

        {/* University Logo */}
        <div className="flex flex-col items-center mt-2">
          <img src={logoPath} alt="logo" className="w-28 mb-2" />

          <h1 className="text-3xl font-bold text-center">MAHATMA GANDHI UNIVERSITY</h1>
          <h2 className="text-lg text-center font-semibold">
            UNIVERSITY COLLEGE OF ENGINEERING &amp; TECHNOLOGY
          </h2>

          <p className="text-sm text-center leading-tight">
            Panagal, NALGONDA - 508 001, T.S., India <br />
            Phone: (O) 08682 - 222869
          </p>
        </div>

        {/* Serial No + Date */}
        <div className="flex justify-between mt-6 px-4">
          <p>
            <strong>Sl. No:</strong> {serialNo}
          </p>
          <p>
            <strong>Date:</strong> {date}
          </p>
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold underline mt-6">CONDUCT CERTIFICATE</h2>

        {/* Content */}
        <div className="mt-10 px-6 text-lg">
          <p className="mb-6">
            This is to certify that Mr/Ms. <strong>{studentName}</strong>
          </p>

          <p className="mb-6">
            S/o., D/o., Sri/Smt. <strong>{parentName}</strong>
          </p>

          <p className="mb-6">
            is/was a student of <strong>{course}</strong> Course
          </p>

          <p className="mb-6">
            during <strong>{fromYear}</strong> - <strong>{toYear}</strong> and that he/she bears good
            conduct.
          </p>
        </div>

        {/* Principal Sign */}
        <div className="absolute bottom-20 right-20 text-center">
          <img src={principalSign} alt="principal sign" className="w-40 mb-2" />
          <p className="font-semibold">Principal</p>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadPDF}
        className="mt-5 px-6 py-2 bg-green-600 text-white rounded-md shadow-md"
      >
        Download PDF
      </button>
    </div>
  );
};

export default ConductCertificate;
