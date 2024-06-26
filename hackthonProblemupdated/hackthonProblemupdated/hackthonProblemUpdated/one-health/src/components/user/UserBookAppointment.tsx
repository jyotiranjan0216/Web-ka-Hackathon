import { collection, doc, getDocs, query } from "firebase/firestore";
import { useState, useEffect, useContext } from "react";
import { Button } from "react-bootstrap";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { selectCategories } from "../../constants/selectCategories";
import UserContext from "../../context/userContext";
import { db } from "../../lib/firebase";
import { DoctorModel } from "../../models/doctorModel";
import DoctorCard from "./DoctorCard";
import SelectCategory from "./SelectCategory";

const UserBookAppointment = () => {
  const { user } = useContext(UserContext);
  const [doctors, setDoctors] = useState([] as any);
  const [category, setCategory] = useState("select");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState([] as any);
  const userRef = doc(collection(db, "users"), user?.uid);
  const [value] = useDocumentData(userRef);

  const handleCategoryChange = (e: any) => {
    setCategory(e.target.value);
    handleSearch();
  };

  const handleSearch = () => {
    const docs = doctors.filter((doc: DoctorModel) =>
      doc.specialization.includes(category)
    );
    setFilteredDoctors(docs);
  };

  const fetchDoctors = async () => {
    setFetchLoading(true);
    try {
      const doctorsQuery = query(collection(db, "doctors"));
      const res = (await getDocs(doctorsQuery)).docs.map((doc) => ({
        ...doc.data(),
      }));
      setDoctors(res);
    } catch (error) {
      console.log(error);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="mt-3">
      <div className="text-center">
        <div>
          <div className="mb-3">
            <b>Select Category:</b>
          </div>
          <div className="mb-3">
            <div className="d-flex justify-content-center">
              <SelectCategory
                category={category}
                handleCategoryChange={handleCategoryChange}
                selectCategories={selectCategories}
              />
              <Button onClick={handleSearch} variant="primary text-sm">
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 w-75 mx-auto d-flex justify-content-around">
        {fetchLoading && <p>loading...</p>}
        {category === "select" &&
          doctors.map((doctor: DoctorModel) => {
            return (
              <div>
                <DoctorCard
                  key={doctor.uid}
                  doctor={doctor}
                  currentUserAppointments={value?.appointments}
                />
              </div>
            );
          })}
        {category !== "select" &&
          filteredDoctors.length > 0 &&
          filteredDoctors.map((doctor: DoctorModel) => {
            return (
              <DoctorCard
                key={doctor.uid}
                doctor={doctor}
                currentUserAppointments={value?.appointments}
              />
            );
          })}
      </div>
    </div>
  );
};

export default UserBookAppointment;
