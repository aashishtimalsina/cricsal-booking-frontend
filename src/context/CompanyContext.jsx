import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCompany } from "../api/company";

const DEFAULT_COMPANY = {
  name: "Jumpers Cricket Academy",
  short_name: "JCA",
  tagline: "Cricket ground & academy",
  email: "info@jumperscricketacademy.com",
  phone: "+977-9765022738",
  address: "Dhapakhel-24,Lalitpur , Lalitpur, Nepal",
  footer_note: "Jumpers Cricket Academy",
};

const CompanyContext = createContext({
  company: DEFAULT_COMPANY,
  loading: true,
  error: null,
  reload: async () => {},
});

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCompany();
      setCompany({ ...DEFAULT_COMPANY, ...data });
    } catch (e) {
      setError(e);
      setCompany(DEFAULT_COMPANY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (company?.name) {
      document.title = company.tagline
        ? `${company.name} — ${company.tagline}`
        : company.name;
    }
  }, [company?.name, company?.tagline]);

  const value = useMemo(
    () => ({
      company,
      loading,
      error,
      reload: load,
    }),
    [company, loading, error],
  );

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
