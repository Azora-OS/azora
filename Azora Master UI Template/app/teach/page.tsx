"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TeachPage() {
  const [formStep, setFormStep] = useState(1)
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "",
    duration: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCourseData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formStep < 4) {
      setFormStep(formStep + 1)
    } else {
      alert("Course created successfully! You can now upload content.")
      setFormStep(1)
      setCourseData({
        title: "",
        description: "",
        category: "",
        level: "",
        price: "",
        duration: "",
      })
    }
  }

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Share Your Expertise</h1>
          <p className="text-lg text-muted-foreground">
            Create and sell courses on Azora Sapiens. Reach millions of learners worldwide.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 mx-1 rounded-full ${step <= formStep ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">Step {formStep} of 4</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8">
          {formStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Course Basics</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Course Title *</label>
                <Input
                  type="text"
                  name="title"
                  placeholder="e.g., Advanced Machine Learning"
                  value={courseData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                <textarea
                  name="description"
                  placeholder="Describe what students will learn..."
                  value={courseData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  required
                />
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Course Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Health">Health</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Level *</label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration *</label>
                  <Input
                    type="text"
                    name="duration"
                    placeholder="e.g., 8 weeks"
                    value={courseData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Price (USD) *</label>
                  <Input
                    type="number"
                    name="price"
                    placeholder="e.g., 49"
                    value={courseData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Course Content</h2>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">Upload course curriculum and modules</p>
                <Button variant="outline">+ Add Modules</Button>
              </div>
            </div>
          )}

          {formStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Review & Publish</h2>
              <div className="space-y-3 bg-background p-4 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium text-foreground">Title:</span> {courseData.title || "Not set"}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-foreground">Category:</span> {courseData.category || "Not set"}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-foreground">Level:</span> {courseData.level || "Not set"}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-foreground">Price:</span> ${courseData.price || "0"}
                </p>
              </div>
              <div className="bg-accent/10 border border-accent p-4 rounded-lg text-sm text-accent-foreground">
                Your course will be reviewed and published within 24 hours.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {formStep > 1 && (
              <Button type="button" variant="outline" onClick={() => setFormStep(formStep - 1)} className="flex-1">
                Previous
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {formStep === 4 ? "Create Course" : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
