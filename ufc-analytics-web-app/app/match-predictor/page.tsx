"use client";

import { useState } from 'react';
import styles from "./MatchPredictorPage.module.css"
import { Button } from "@/components/ui/button";;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftCircle, Swords } from "lucide-react";
import Link from 'next/link';
import MatchPredictor from '../../components/MatchPredictor';

// Define the types for fighters and predictions
interface Fighter {
  id: number;
  name: string;
  weight: string;
  record: string;
}

interface Prediction {
  fighter1Chance: number;
  fighter2Chance: number;
}

// Mock data for fighters
const fighters: Fighter[] = [
  { id: 1, name: "Jon Jones", weight: "Heavyweight", record: "26-1-0" },
  { id: 2, name: "Francis Ngannou", weight: "Heavyweight", record: "17-3-0" },
  { id: 3, name: "Israel Adesanya", weight: "Middleweight", record: "23-2-0" },
  { id: 4, name: "Alexander Volkanovski", weight: "Featherweight", record: "25-2-0" },
];

export default function MatchPredictorPage() {
  const [fighter1, setFighter1] = useState<Fighter | null>(null);
  const [fighter2, setFighter2] = useState<Fighter | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  // Function to handle match prediction logic
  const handlePredict = () => {
    if (fighter1 && fighter2) {
      const fighter1Chance = Math.random() * 100;
      const fighter2Chance = 100 - fighter1Chance;
      setPrediction({ fighter1Chance, fighter2Chance });
    }
  };

  return (
    <div className={`${styles.pageContainer} min-h-screen text-black p-8`}>
      <Link href="/" className={`${styles.backLink} inline-flex items-center mb-8`}>
        <ArrowLeftCircle className="mr-2" />
        Back to Dashboard
      </Link>

      <h1 className={`${styles.pageTitle} text-4xl font-bold mb-8 text-center`}>UFC Match Predictor</h1>
      <Card className={`${styles.cardContainer} max-w-2xl mx-auto`}>
        <CardHeader>
          <CardTitle className="text-2xl">Select Fighters</CardTitle>
          <CardDescription>Choose two fighters to predict the match outcome</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2">Fighter 1</label>
              <Select onValueChange={(value: string) => setFighter1(fighters.find(f => f.id === parseInt(value)) || null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fighter" />
                </SelectTrigger>
                <SelectContent>
                  {fighters.map((fighter) => (
                    <SelectItem key={fighter.id} value={fighter.id.toString()}>
                      {fighter.name} ({fighter.weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2">Fighter 2</label>
              <Select onValueChange={(value: string) => setFighter2(fighters.find(f => f.id === parseInt(value)) || null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fighter" />
                </SelectTrigger>
                <SelectContent>
                  {fighters.map((fighter) => (
                    <SelectItem key={fighter.id} value={fighter.id.toString()}>
                      {fighter.name} ({fighter.weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handlePredict}
            disabled={!fighter1 || !fighter2}
            className="w-full"
            >
            <Swords className="mr-2" />
            Predict Match
          </Button>

          {prediction && (
            <Card className="mt-8 bg-gray-700">
              <CardHeader>
                <CardTitle>Match Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fighter1 && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{fighter1.name}</span>
                        <span>{prediction.fighter1Chance.toFixed(1)}%</span>
                      </div>
                      <Progress value={prediction.fighter1Chance} className="h-2" />
                    </div>
                  )}
                  {fighter2 && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{fighter2.name}</span>
                        <span>{prediction.fighter2Chance.toFixed(1)}%</span>
                      </div>
                      <Progress value={prediction.fighter2Chance} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <MatchPredictor/>
    </div>
  );
}

