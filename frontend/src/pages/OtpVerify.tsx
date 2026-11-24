// import React from 'react'
import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import PageTitle from "@/services/PageTitle";
const OtpVerify = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }
    if (otp === "123456") {
      alert("OTP verified successfully!");
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center w-20 h-20">
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-zinc-400">ENTER OTP</span>

          <input
            className="h-13 rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-purple-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-purple-500/10"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            required
          />
        </label>

        {/* Submit */}
        <button
          className="h-13 rounded-xl bg-purple-500 text-sm font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
          type="submit"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default OtpVerify;
