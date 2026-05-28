'use client'

import React, { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Step {
    id: string
    title: string
    description?: string
    content: React.ReactNode
}

interface CurriculumStepperProps {
    steps: Step[]
}

export function CurriculumStepper({ steps }: CurriculumStepperProps) {
    const [currentStep, setCurrentStep] = useState(0)

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Desktop Stepper Header */}
            <div className="relative hidden md:flex justify-between items-center w-full mb-8">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -z-10 -translate-y-1/2"></div>
                
                {steps.map((step, index) => {
                    const isActive = index === currentStep
                    const isCompleted = index < currentStep

                    return (
                        <div 
                            key={step.id} 
                            className="flex flex-col items-center gap-2 bg-background px-2 cursor-pointer z-10"
                            onClick={() => setCurrentStep(index)}
                        >
                            <div className={`
                                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                                ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                                  isCompleted ? 'border-primary bg-primary/10 text-primary' : 
                                  'border-muted-foreground bg-background text-muted-foreground'}
                            `}>
                                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span>{index + 1}</span>}
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Mobile Stepper Header */}
            <div className="md:hidden flex flex-col gap-2 mb-6">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                    Langkah {currentStep + 1} dari {steps.length}
                </div>
                <Select
                    value={currentStep.toString()}
                    onValueChange={(value) => setCurrentStep(parseInt(value))}
                >
                    <SelectTrigger className="w-full bg-background font-semibold h-12">
                        <SelectValue placeholder="Pilih langkah..." />
                    </SelectTrigger>
                    <SelectContent>
                        {steps.map((step, index) => (
                            <SelectItem key={step.id} value={index.toString()}>
                                {step.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Stepper Content */}
            <div className="min-h-[400px]">
                {steps[currentStep].content}
            </div>

            {/* Stepper Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
                <Button 
                    variant="outline" 
                    onClick={handlePrev} 
                    disabled={currentStep === 0}
                >
                    Sebelumnya
                </Button>
                
                {currentStep < steps.length - 1 ? (
                    <Button onClick={handleNext}>
                        Selanjutnya
                    </Button>
                ) : (
                    <div></div> // Let the final step content handle the "Submit" action
                )}
            </div>
        </div>
    )
}
