import React from "react"
import { featuresData } from "./FeaturesData";
import {FeatureCard} from "./FeatureCard";

const FeaturesSection = ({ theme, sectionRef }) => {

    return (
        <section id="features" ref={sectionRef} className={`min-h-screen py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="feature opacity-0 text-4xl font-bold text-center mb-12">Unique Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuresData.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} theme={theme} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeaturesSection;