/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Pressable, FlatList } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  useWindowDimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState('100');
  const dismissKeyboard = () => Keyboard.dismiss();
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const fmt2 = (n: number) => {
    const rounded = Math.round(n * 100) / 100;
    const str = rounded.toFixed(2);
    return str.replace(/\.?0+$/, '');
  };
  // Helper to handle capped input
  const handleWeightInput = (text: string) => {
    let num = parseInt(text.replace(/[^0-9]/g, '')) || 0;
    if (num > 300) num = 300;
    setWeight(num > 0 ? String(num) : '');
  };
  const [percentage, setPercentage] = useState(50); // default to 50%
  const [showPercentageModal, setShowPercentageModal] = useState(false);
  const [barbellWeight, setBarbellWeight] = useState(20);
  const [showPlateList, setShowPlateList] = useState(true);
  const [barSide, setBarSide] = useState<'left' | 'right'>('left'); // default off => left side
  const [showSettings, setShowSettings] = useState(false);

  // Load last used barbell type on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('barbellWeight');
        if (stored) setBarbellWeight(Number(stored));
        const storedSide = await AsyncStorage.getItem('barSide');
        if (storedSide === 'left' || storedSide === 'right') setBarSide(storedSide);
      } catch {}
    })();
  }, []);

  // Save barbell type when changed
  useEffect(() => {
    AsyncStorage.setItem('barbellWeight', String(barbellWeight));
  }, [barbellWeight]);
  useEffect(() => {
    AsyncStorage.setItem('barSide', barSide);
  }, [barSide]);

  const handlePercentageChange = (delta: number) => {
    dismissKeyboard();
    const maxPercent = inputWeight > 0 ? (300 / inputWeight) * 100 : Infinity;
    setPercentage((prev) => {
      const next = Math.max(0, prev + delta);
      return round2(Math.min(next, maxPercent));
    });
  };

  const handleBarbellToggle = () => {
    dismissKeyboard();
    setBarbellWeight((prev) => (prev === 20 ? 15 : 20));
  };

  // Plate options: [weight, color]
  const plateOptions = [
    { weight: 25, color: '#B71C1C', label: '25kg (dark red)' },
    { weight: 20, color: '#0D47A1', label: '20kg (dark blue)' },
    { weight: 15, color: '#FFD600', label: '15kg (yellow)' },
    { weight: 10, color: '#388E3C', label: '10kg (green)' },
    { weight: 5, color: '#ECECEC', label: '5kg (white)' },
    { weight: 2.5, color: '#d2443a', label: '2.5kg (light red)' },
    { weight: 1.25, color: '#000000', label: '1.25kg (black)' },
  ];

  // Calculate target weight, capped at 300kg
  const inputWeight = parseFloat(weight) || 0;
  const maxPercentage = inputWeight > 0 ? (300 / inputWeight) * 100 : Infinity;
  const effectivePercentage = Math.min(percentage, maxPercentage);
  let targetWeight = Math.round((inputWeight * (effectivePercentage / 100)) * 100) / 100;
  if (targetWeight > 300) targetWeight = 300;
  const weightPerSide = (targetWeight - barbellWeight) / 2;

  // If weight changes and the stored percentage is now above the cap, clamp it.
  useEffect(() => {
    if (inputWeight <= 0) return;
    setPercentage((prev) => round2(Math.min(prev, maxPercentage)));
  }, [inputWeight, maxPercentage]);

  // Calculate plates per side:
  // - If weightNeeded is within a single full set (78.75 kg), use greedy with max 1 of each plate.
  // - If it exceeds that, place one of each plate first, then greedy-add duplicates from heaviest down.
        function calculatePlates(weightNeeded: number) {
          const totalSingleSet = plateOptions.reduce((sum, p) => sum + p.weight, 0); // 78.75
          const plateCounts: { [weight: number]: { color: string; count: number } } = {};
          const baseCounts: { [weight: number]: number } = {}; // counts that must be preserved (the “one of each” set)
          const epsilon = 0.0001; // float guard
          const addPlateCount = (plateWeight: number, delta: number) => {
            if (delta === 0) return;
            const plate = plateOptions.find((p) => p.weight === plateWeight)!;
            if (!plateCounts[plateWeight]) {
              plateCounts[plateWeight] = { color: plate.color, count: 0 };
            }
            plateCounts[plateWeight].count += delta;
          };

          if (weightNeeded <= totalSingleSet + epsilon) {
            // Greedy without duplicates (max 1 each)
            let remaining = weightNeeded;
            for (const plate of plateOptions) {
              if (remaining + epsilon >= plate.weight) {
                addPlateCount(plate.weight, 1);
                remaining = Math.round((remaining - plate.weight) * 100) / 100;
              }
            }
          } else {
            // Phase A: one of each (record as base that should not be consolidated away)
            plateOptions.forEach((plate) => {
              addPlateCount(plate.weight, 1);
              baseCounts[plate.weight] = 1;
            });
            // Phase B: greedy duplicates on the remainder
            let remaining = Math.round((weightNeeded - totalSingleSet) * 100) / 100;
            for (const plate of plateOptions) {
              if (remaining + epsilon < plate.weight) continue;
              const extra = Math.floor((remaining + epsilon) / plate.weight);
              if (extra > 0) {
                addPlateCount(plate.weight, extra);
                remaining = Math.round((remaining - plate.weight * extra) * 100) / 100;
              }
            }

            // Consolidate only EXCESS small-plate pairs upward; never consume the base 1-per-plate set.
            const ascWeights = [...plateOptions].map((p) => p.weight).reverse(); // lightest -> heaviest
            for (let i = 0; i < ascWeights.length - 1; i++) {
              const cur = ascWeights[i];
              const next = ascWeights[i + 1];
              const curCount = plateCounts[cur]?.count || 0;
              const base = baseCounts[cur] || 0;
              const excess = curCount - base;
              const pairs = Math.floor(excess / 2);
              if (pairs > 0) {
                addPlateCount(cur, -pairs * 2);
                addPlateCount(next, pairs);
              }
            }
          }

          return plateOptions
            .filter((p) => plateCounts[p.weight])
            .map((p) => ({ weight: p.weight, color: p.color, count: plateCounts[p.weight].count }));
        }

  const platesPerSide = weightPerSide > 0 ? calculatePlates(weightPerSide) : [];
  const actualPerSide = platesPerSide.reduce((sum, p) => sum + p.weight * p.count, 0);
  const actualTotal = barbellWeight + actualPerSide * 2;
  const mismatch = round2(actualTotal - targetWeight);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, styles.darkBg, { paddingTop: 24 + insets.top }]}>
        {/* Weight input label above field */}
        <View style={[styles.topRow]}>
          <View style={[styles.topFieldColumn]}>
            <Text style={styles.label}>1RM Weight:</Text>
            <TextInput
              style={[styles.input, styles.darkInput, { width: 80 }]}
              keyboardType="numeric"
              value={weight}
              onChangeText={handleWeightInput}
              placeholder="Enter weight in kg"
              placeholderTextColor="#888"
              maxLength={6}
            />
          </View>
          <View style={[styles.topFieldColumnRight]}>
            <Text style={styles.labelRight}>Barbell weight:</Text>
            <TouchableOpacity style={styles.barbellToggle} onPress={handleBarbellToggle}>
              <Text style={{ color: '#fff', fontSize: 15, marginRight: 6 }}>{barbellWeight} kg</Text>
              <Text style={{ color: '#facf79', fontSize: 13, marginLeft: 8 }}>(Tap to change)</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.percentageRow}>
        <View style={styles.percentageSideBtns}>
          <TouchableOpacity style={styles.button} onPress={() => handlePercentageChange(-5)}>
            <Text style={styles.buttonText}>-5%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePercentageChange(-2.5)}>
              <Text style={styles.buttonText}>-2.5%</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.percentageCenter}
            onPress={() => {
              dismissKeyboard();
              setShowPercentageModal(true);
            }}
          >
          <Text style={styles.value}>
            {Number.isInteger(percentage) ? percentage : percentage.toString()}%
          </Text>
            <Text style={{ color: '#aaa', fontSize: 12 }}>Tap to select</Text>
          </TouchableOpacity>
        <View style={styles.percentageSideBtns}>
          <TouchableOpacity style={styles.button} onPress={() => handlePercentageChange(2.5)}>
            <Text style={styles.buttonText}>+2.5%</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePercentageChange(5)}>
            <Text style={styles.buttonText}>+5%</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#aaa', fontSize: 14 }}>
          {(() => {
            if (effectivePercentage < 60) return 'Light';
            if (effectivePercentage < 75) return 'Moderate';
            if (effectivePercentage < 90) return 'Heavy';
            return 'Max';
          })()}
        </Text>
      </View>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => {
            dismissKeyboard();
            setShowSettings(true);
          }}
          style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#333' }}
        >
          <Text style={{ color: '#ddd' }}>Settings</Text>
        </TouchableOpacity>
      </View>

        {/* Percentage select modal */}
      <Modal visible={showPercentageModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            dismissKeyboard();
            setShowPercentageModal(false);
          }}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.label, { marginBottom: 12 }]}>Select Percentage</Text>
            <FlatList
                data={[40, 50, 60, 70, 80, 90, 100]}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    const maxPercent = inputWeight > 0 ? (300 / inputWeight) * 100 : Infinity;
                    setPercentage(round2(Math.min(item, maxPercent)));
                    setShowPercentageModal(false);
                  }}
                >
                    <Text style={styles.value}>{item}%</Text>
                  </TouchableOpacity>
                )}
            />
          </View>
        </Pressable>
      </Modal>
      {/* Settings modal */}
      <Modal visible={showSettings} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            dismissKeyboard();
            setShowSettings(false);
          }}
        >
          <View style={[styles.modalContent, { width: 260 }]}>
            <Text style={[styles.label, { marginBottom: 12 }]}>Settings</Text>
            <View
              style={[
                styles.modalItem,
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 220 },
              ]}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.value, { fontSize: 16 }]}>Show {barSide === 'left' ? 'right' : 'left'} plates</Text>
              </View>
              <Switch
                value={barSide === 'right'}
                onValueChange={(v) => setBarSide(v ? 'right' : 'left')}
                trackColor={{ false: '#555', true: '#6ddf7a' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </Pressable>
      </Modal>

        {/* Barbell weight toggle moved inline above */}

        {/* Barbell visual */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <BarbellVisual
          plates={platesPerSide}
          width={Math.max(320, screenWidth - 48)}
          flipped={barSide === 'left'}
        />
      </View>

      <View style={{ marginVertical: 16, minHeight: 180, justifyContent: 'flex-start' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#fff' }}>Target: {fmt2(targetWeight)} kg</Text>
        <Text
          style={{
            fontSize: 15,
            marginBottom: 4,
            color: mismatch === 0 ? '#6ddf7a' : '#f4d35e',
          }}
        >
          {mismatch === 0 ? 'Exact match' : `${mismatch > 0 ? '+' : ''}${fmt2(mismatch)} kg mismatch`}
        </Text>

        <TouchableOpacity
          onPress={() => setShowPlateList((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
        >
          <Text style={{ fontSize: 15, color: '#ccc' }}>
            Plates per side ({fmt2(actualPerSide)} kg):
          </Text>
          <Text style={{ color: '#888', marginLeft: 6 }}>{showPlateList ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showPlateList &&
          (() => {
            const maxPlateLines = 7; // maximum number of different plates possible
            const lines = [];
            for (let i = 0; i < maxPlateLines; i++) {
              if (platesPerSide[i]) {
                const plateColor = platesPerSide[i].color;
                const shadowColor = plateColor === '#000000' ? '#fff' : '#222';
                lines.push(
                  <Text
                    key={platesPerSide[i].weight}
                    style={{
                      color: plateColor,
                      fontSize: 20,
                      textShadowColor: shadowColor,
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                    }}
                  >
                    {platesPerSide[i].count}x {platesPerSide[i].weight}kg
                  </Text>
                );
              } else {
                // Render invisible placeholder to reserve space
                lines.push(
                  <Text key={'placeholder-' + i} style={{ fontSize: 20, opacity: 0 }}>
                    placeholder
                  </Text>
                );
              }
            }
            if (platesPerSide.length === 0) {
              // Show 'No plates needed' in the first line
              lines[0] = (
                <Text key="no-plates" style={{ color: '#888', fontSize: 20 }}>
                  No plates needed
                </Text>
              );
            }
            return lines;
          })()}
      </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// Visual component for the barbell and plates (one side)
function BarbellVisual({
  plates,
  width = 320,
  flipped = false,
}: {
  plates: { weight: number; color: string; count: number }[];
  width?: number;
  flipped?: boolean;
}) {
  // SVG dimensions
  const barThickness = 30;
  const basePlateHeight = barThickness * 9;
  const plateHeightMap: Record<number, number> = {
    25: basePlateHeight,
    20: basePlateHeight,
    15: basePlateHeight,
    10: basePlateHeight,
    5: basePlateHeight * 0.6,
    2.5: basePlateHeight * 0.5,
    1.25: basePlateHeight * 0.4,
  };
  const height = basePlateHeight + 40; // add padding for curved end and centering
  const stopWidth = 10;
  const endWidth = 20;
  const stopColor = '#888';
  const barColor = '#888';
  // Plate thicknesses (visual, not real)
  const plateThicknessMap: Record<number, number> = {
    25: 48,
    20: 42,
    15: 36,
    10: 30,
    5: 21,
    2.5: 18,
    1.25: 15,
  };
  
  // Calculate total width needed for all plates
  let totalPlateWidth = 0;
  const plateWidths: number[] = [];
  plates.forEach((p) => {
    const thickness = plateThicknessMap[p.weight] || 8;
    for (let j = 0; j < p.count; j++) {
      plateWidths.push(thickness);
      totalPlateWidth += thickness;
    }
  });
  // Start position: flush to the stop on the chosen side
  let x = flipped ? endWidth + stopWidth : width - endWidth - stopWidth - totalPlateWidth;
  return (
    <Svg width={width} height={height}>
      {/* Bar (horizontal) */}
      <Rect
        x={0}
        y={height / 2 - barThickness / 2}
        width={width}
        height={barThickness}
        fill={barColor}
        rx={barThickness / 4} // slightly rounded, flatter left end
      />
      {/* Bar end (right or left depending on flip) */}
      <Rect
        x={flipped ? 0 : width - endWidth}
        y={height / 2 - barThickness}
        width={endWidth}
        height={barThickness * 2}
        fill={'#666'}
        rx={6}
      />
      {/* Plates (largest to smallest, flush to stop) */}
      <G>
        {(() => {
          const renderPlates = flipped ? plates : [...plates].reverse();
          const rects: JSX.Element[] = [];
          renderPlates.forEach((p) => {
            const thickness = plateThicknessMap[p.weight] || 8;
            const plateHeight = plateHeightMap[p.weight] || basePlateHeight;
            for (let j = 0; j < p.count; j++) {
              rects.push(
                <Rect
                  key={`${flipped ? 'L' : 'R'}-${p.weight}-${j}-${thickness}-${plateHeight}`}
                  x={x}
                  y={height / 2 - plateHeight / 2}
                  width={thickness}
                  height={plateHeight}
                  fill={p.weight === 15 ? '#FFD600' : p.color}
                  stroke={p.weight === 1.25 ? '#fff' : '#222'}
                  strokeWidth={1}
                  rx={thickness / 3}
                />
              );
              x += thickness;
            }
          });
          return rects;
        })()}
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#222',
  },
  darkBg: {
    backgroundColor: '#222',
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderColor: '#555',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topFieldColumn: {
    flex: 1,
  },
  topFieldColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  percentageSideBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 24,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  modalItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    width: 120,
  },
  label: {
    color: '#bfbfbf',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginRight: 8,
  },
  labelRight: {
    color: '#bfbfbf',
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    fontSize: 18,
    marginBottom: 16,
    width: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#595959',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 16,
    color: '#d7d7d7',
  },
  value: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  barbellToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
    marginLeft: 8,
  },
});

export default App;
