import React, { createContext, useContext, useState } from "react";

const JobContext = createContext({
  jobs: [],
  addJob: () => {},
  removeJob: () => {},
});

export const useJobContext = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);

  const addJob = (job) => {
    setJobs((prev) => [...prev, job]);
  };

  const removeJob = (id) => {
    setJobs((prev) => prev.filter(job => job.id !== id));
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, removeJob }}>
      {children}
    </JobContext.Provider>
  );
};

export default JobContext; 