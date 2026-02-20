import React from 'react';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useEffect } from 'react';
import { useState } from 'react';
import Loader from '../../../components/Loader';
import { useParams } from 'react-router-dom';
import Table from '../../../components/Tables';
import { dateFormat } from '../../../helpers/dateHelper';

const JobApplicants = () => {
    const { mutate } = useApiMutation();

    const [applicants, setApplicantsData] = useState([]);
    const [jobData, setJobData] = useState({});
    const [loading, setIsLoading] = useState(true);

    const { id } = useParams();


    const getJobData = (id) => {
        mutate({
            url: `/admin/job?jobId=${id}`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setJobData(response.data.data);
                getApplicants();
            },
            onError: () => {
                setIsLoading(false);
            }
        });
    }

    const getApplicants = () => {
        mutate({
            url: `/admin/job/applicants?jobId=${id}`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                setApplicantsData(response.data.data);
                setIsLoading(false);
            },
            onError: () => {
            }
        });
    }


    useEffect(() => {
        getJobData(id);
    }, []);

    return (
        <div className="min-h-screen">
            {loading ?
                <div className="w-full h-screen flex items-center justify-center">
                    <Loader />
                </div>
                :
                <>
                    <div className="rounded-md pb-2 w-full gap-5"><h2 className="text-lg font-semibold text-black-700 mb-4">Job Applicants for {jobData.title}</h2></div>
                    <div className="bg-white rounded-md p-6 w-full gap-5">
                        <h2 className="text-lg font-semibold text-black-700 mb-4">Job Applicants</h2>
                        <div className="overflow-x-auto mt-5">
                            <Table
                                headers={[
                                    { key: 'name', label: 'Name' },
                                    { key: 'emailAddress', label: 'Email' },
                                    { key: 'phoneNumber', label: 'Phone Number' },
                                    {
                                        key: 'resume',
                                        label: 'Resume',
                                        render: (value) => (
                                            <span className='py-1 rounded-full text-sm capitalize'>
                                                <a href={value} target='_blank' className='text-blue-500'>View Resume</a>
                                            </span>
                                        )
                                    },
                                    { key: 'createdAt', label: 'Date Applied', render: (value) => dateFormat(value, 'dd-MM-yyyy') },
                                ]}
                                data={applicants}
                                actions={[]}
                                currentPage={null}
                                totalPages={null}
                            />
                        </div>
                    </div>
                </>
            }
        </div>
    );
};

export default JobApplicants;
