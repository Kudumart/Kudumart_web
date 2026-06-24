import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./components/style.css";
import { useNavigate, useParams } from "react-router-dom";
import { useApplyJob, useViewJobClient } from "../../api/jobs";
import Loader from "../../components/Loader";
import { useState } from "react";
import useFileUpload from "../../api/hooks/useFileUpload";
import { toast } from "react-toastify";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [check, setcheck] = useState(false);
  const [form, setform] = useState({
    name: "",
    emailAddress: "",
    phoneNumber: "",
    resumeType: "",
    resume: "",
  });
  const { uploadFiles, isLoadingUpload } = useFileUpload();
  const { mutate: applyJob, isLoading: isApplying } = useApplyJob();

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const { data: jobDetail, isLoading, isFetching } = useViewJobClient(jobId);

  if (isFetching)
    return (
      <div className="py-40">
        <Loader />
      </div>
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!check) {
      toast.error("verify your are not a rebot");
      return;
    }
    applyJob(
      {
        jobId,
        name: form.name,
        emailAddress: form.emailAddress,
        phoneNumber: form.phoneNumber,
        resume: form.resume,
        resumeType: form.resumeType,
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
      },
    );
  };

  const handleResume = async (e) => {
    const file = e.target.files;

    if (file[0]) {
      await uploadFiles(file, (uploadedUrls) => {
        setform({ ...form, resume: uploadedUrls[0] });
        const fileType = uploadedUrls[0].split(".").pop();
        setform({ ...form, resumeType: fileType });
      });
    }
  };

  // return (
  //   <div className="w-full min-h-screen py-[200px]">
  //     {JSON.stringify(jobDetail)}
  //   </div>
  // );
  return (
    <>
      <div className="w-full flex flex-col">
        <section
          className="breadcrumb"
          style={{
            backgroundImage: `url(https://res.cloudinary.com/greenmouse-tech/image/upload/v1738015034/image_5_vbukr9.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col py-12">
            <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap-8 gap-5 h-full">
              <h1 className="text-4xl font-bold">Job Details</h1>
            </div>
          </div>
        </section>
      </div>
      <div className="w-full flex flex-col xl:px-40 lg:pl-20 lg:pr-36 md:px-20 px-5 py-3 lg:gap-10 md:gap- gap-5 h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 Justing">
          {/* Left Side: Job Information */}
          <div className="md:col-span-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              {jobDetail.title}
            </h1>

            {/* Job Meta */}
            <div className="flex items-center gap-4 text-gray-500 mt-2">
              <div className="flex items-center gap-1 text-orange-500 capitalize">
                <FaMapMarkerAlt />
                <span>{jobDetail.workplaceType}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-500 capitalize">
                <FaClock />
                <span>{jobDetail?.jobType}</span>
              </div>
            </div>

            <button className="bg-black text-white py-2 px-6 rounded-lg mt-4">
              Apply Now
            </button>

            {/* Company Description */}
            {/* <div className="mt-6">
              <h2 className="text-xl font-semibold leading-loose">
                Company Description
              </h2>
              <p className="text-gray-700 mt-2 leading-loose">
                Kudu is currently seeking a highly motivated and experienced
                Senior Tax Analyst to join our team. As a rapidly growing
                company, we are looking for talented individuals who are
                committed to helping us achieve our goals.
              </p>
            </div> */}

            {/* Job Description */}
            <div className="mt-6">
              {/* <h2 className="text-xl font-semibold leading-loose">
                Job Description
              </h2> */}
              {/* <ul className="list-disc list-inside text-gray-700 mt-2 leading-loose space-y-2">
                <li>
                  Prepare U.S. indirect tax filings for Sales Tax and Use Tax.
                </li>
                <li>
                  Research, calculate, and report gross receipts and use tax.
                </li>
                <li>
                  Prepare reconciliations of U.S. indirect tax general ledger
                  accounts.
                </li>
                <li>Identify and implement process improvements.</li>
                <li>Respond to and resolve notices promptly.</li>
                <li>Special projects as needed.</li>
              </ul> */}
              <div
                className="text-sm text-black leading-loose"
                dangerouslySetInnerHTML={{ __html: jobDetail?.description }}
              ></div>
            </div>

            {/* Required Skills */}
            {/* <div className="mt-6">
              <h2 className="text-xl font-semibold">Required Skills</h2>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
                <li>Advanced knowledge of tax accounting and tax law.</li>
                <li>
                  Experience with preparing complicated tax returns for
                  corporate.
                </li>
                <li>Detail-oriented and able to meet tight deadlines.</li>
                <li>Advanced knowledge of Microsoft Excel and Word.</li>
                <li>
                  Experience in a Big-4 public accounting firm is preferred.
                </li>
              </ul>
            </div> */}

            {/* Qualification */}
            {/* <div className="mt-6">
              <h2 className="text-xl font-semibold leading-loose">
                Qualification
              </h2>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2 leading-loose">
                <li>BS/BA degree in Accounting, Finance, or Business.</li>
                <li>
                  3+ years of U.S. tax experience in a public accounting firm.
                </li>
              </ul>
            </div> */}
          </div>

          {/* Right Side: Apply Form */}
          <div className="bg-white p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Apply Now</h2>
            <p className="text-gray-600 text-sm">
              Fill the form to submit your application
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="mb-4">
                <label className="text-gray-700 text-sm">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full border p-4 rounded-md mt-4"
                  style={{ outline: "none" }}
                  required
                  name="name"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full border p-4 rounded-md mt-4"
                  style={{ outline: "none" }}
                  required
                  name="phoneNumber"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border p-4 rounded-md mt-4"
                  style={{ outline: "none" }}
                  required
                  name="emailAddress"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm">
                  Attach CV/Resume
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full border p-4 rounded-md mt-4"
                  style={{ outline: "none" }}
                  required
                  onChange={handleResume}
                />
                <small className="text-gray-500 text-xs">
                  Must be .pdf (Max 2MB)
                </small>
              </div>

              <div className="flex items-center space-x-2 mt-">
                <input
                  type="checkbox"
                  checked={check}
                  onChange={() => setcheck(!check)}
                />
                <span className="text-sm text-gray-700">I'm not a Robot</span>
              </div>

              <button
                disabled={isLoadingUpload || isApplying}
                type="submit"
                className="bg-orange-500 text-white w-full mt-5 py-4 rounded-md hover:bg-orange-600"
              >
                Submit →
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
