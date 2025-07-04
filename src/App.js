import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignupForm from "./components/Signup";
import SignInPage from "./components/SignIn";
import MyWork from "./components/MyWork";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import EstimateForm from "./components/Estimate";

import SubEstimate from "./components/SubEstimate";
import StepperPage from "./components/Stepper";
import ProfilePage from "./components/Profile";
import ForgotPasswordPage from "./components/ForgotPassword";
import PDFGenerator from "./components/PDFGenerator";
import PDFPage from "./components/PDFPage";
import DuplicateEstimate from "./components/DuplicateModal";
import EditEstimatePage from "./components/EditEstimate";
import EditSubEstimateForm from "./components/EditSubEstimate";
import WorkorderManagement from "./components/Trash";
import CoverPageCreator from "./components/Cover";
import CoverPageGenerator from "./components/Cover";
import ConstructionEstimateComponent from "./components/ConstructionEstimate";
import TermsAndConditions from "./components/TermandCondition";
import PrivacyPolicy from "./components/Privacy";
import ResetPasswordPage from "./components/ResetPassword";
function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgotpwd" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage/>} />
          <Route
          path="/policy"
          element={
            
              <PrivacyPolicy />
            
          }
        />
         <Route
          path="/termsandconditions"
          element={
            
              <TermsAndConditions />
            
          }
        />
      
      


        
        {/* Wrapped EstimateForm in Layout to include Sidebar and Header */}
        <Route
          path="/estimate"
          element={
            <Layout>
              <EstimateForm />
            </Layout>
          }
        />
         <Route
          path="/duplicateestimate"
          element={
            <Layout>
              <DuplicateEstimate />
            </Layout>
          }
        />
          <Route
          path="/trash"
          element={
            <Layout>
              <WorkorderManagement />
            </Layout>
          }
        />
         <Route
          path="/editestimate"
          element={
            <Layout>
              <EditEstimatePage />
            </Layout>
          }
        />
         <Route
          path="/pdf-preview"
          element={
            <Layout>
              <PDFGenerator />
            </Layout>
          }
        />
        <Route
          path="/cover"
          element={
            <Layout>
              <CoverPageGenerator />
            </Layout>
          }
        />
        
         <Route
          path="/report"
          element={
            <Layout>
              <PDFPage />
            </Layout>
          }
        />
       
         <Route
          path="/abstract"
          element={
            <Layout>
              <ConstructionEstimateComponent />
            </Layout>
          }
        />
       
          <Route
          path="/subestimate"
          element={
            <Layout>
              <SubEstimate />
            </Layout>
          }
        />
         <Route
          path="/stepper"
          element={
            <Layout>
              <StepperPage />
            </Layout>
          }
        />
           <Route
          path="/editsubestimate" 
          element={
            <Layout>
              <EditSubEstimateForm />
            </Layout>
          }
        />
         <Route
          path="/profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />

        {/* MyWork already has Layout */}
        <Route
          path="/mywork"
          element={
            <Layout>
              <MyWork />
            </Layout>
          }
        />

        {/* Default Landing Page */}
        <Route
          path="/"
          element={
           
              <SignInPage />
            
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
