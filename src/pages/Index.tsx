
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Hospital, Shield, Database, Lock } from "lucide-react";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container py-16 md:py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="space-y-6 lg:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Secure Medical Records on <span className="text-medblue-600">Blockchain</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                MedCord empowers patients with control over their medical data while enabling secure and efficient healthcare information sharing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-full bg-medblue-100 animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-medblue-50 flex items-center justify-center">
                  <Hospital className="h-24 w-24 text-medblue-600" />
                </div>
                <div className="absolute top-1/4 -right-4 p-3 bg-white rounded-xl shadow-lg">
                  <Lock className="h-8 w-8 text-medblue-600" />
                </div>
                <div className="absolute bottom-1/4 -left-4 p-3 bg-white rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-medblue-600" />
                </div>
                <div className="absolute bottom-0 right-0 p-3 bg-white rounded-xl shadow-lg">
                  <Database className="h-8 w-8 text-medblue-600" />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">How MedCord Works</h2>
              <p className="text-muted-foreground">
                Our blockchain technology ensures your medical data is secure, accessible, and always under your control.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="med-card text-center">
                <div className="w-12 h-12 bg-medblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-medblue-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Patient Control</h3>
                <p className="text-muted-foreground">
                  You decide who can access your medical records with fine-grained permission controls.
                </p>
              </div>
              
              <div className="med-card text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Encrypted Security</h3>
                <p className="text-muted-foreground">
                  All medical data is encrypted and can only be accessed by authorized healthcare providers.
                </p>
              </div>
              
              <div className="med-card text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Blockchain Immutability</h3>
                <p className="text-muted-foreground">
                  Every access and change is permanently recorded, ensuring transparency and preventing fraud.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* User Types Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Who Uses MedCord?</h2>
              <p className="text-muted-foreground">
                Our platform serves multiple stakeholders in the healthcare ecosystem
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="med-card">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <span className="text-medblue-500">•</span>
                  Patients
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Full control over your health data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Securely share records with new providers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Track who has accessed your information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Manage permissions with a simple interface</span>
                  </li>
                </ul>
                <Button className="mt-6" asChild>
                  <Link to="/register">Register as Patient</Link>
                </Button>
              </div>
              
              <div className="med-card">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <span className="text-medblue-500">•</span>
                  Healthcare Providers
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Quick access to complete patient history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Securely create and update medical records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Reduce administrative overhead</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Improve coordination of care</span>
                  </li>
                </ul>
                <Button className="mt-6" asChild>
                  <Link to="/register">Register as Provider</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="bg-medblue-600 text-white rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to take control of your medical data?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Join MedCord today and experience the future of secure, patient-centered healthcare record management.
              </p>
              <Button size="lg" variant="outline" className="bg-white text-medblue-600 hover:bg-blue-50" asChild>
                <Link to="/register">Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
