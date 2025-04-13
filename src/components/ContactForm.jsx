
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Map, Phone } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ companyName: "", contactName: "", email: "", phone: "", message: "" });
    toast({
      title: "Success!",
      description: "Thank you for your message! We'll get back to you soon.",
    });
  };

  return (
    <div className="text-black p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
      <p className="text-gray-500 mb-6">Have questions about our service? Let us know and we'll help!</p>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">For Contractors</h3>
        <p className="text-gray-500 mb-6">Looking to hire skilled workers? Complete your inquiry below.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="companyName" className="text-sm block mb-2">Company Name</Label>
            <Input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full" />
          </div>
          
          <div>
            <Label htmlFor="contactName" className="text-sm block mb-2">Contact Person</Label>
            <Input type="text" id="contactName" name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full" />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm block mb-2">Business Email</Label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full" />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm block mb-2">Phone Number</Label>
            <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full" placeholder="+91-XXXXX XXXXX" />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="message" className="text-sm block mb-2">Message</Label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="4" className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF4B55]" />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Button type="submit" variant="primary" className="w-full mt-4">Send Message</Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 flex items-center gap-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <Map className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Email Us</p>
            <p className="font-medium">support@labournet.com</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 flex items-center gap-4">
          <div className="bg-gray-100 p-2 rounded-full">
            <Phone className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Call Us</p>
            <p className="font-medium">+91-92333 44455</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
