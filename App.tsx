/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Pressable, FlatList } from 'react-native';
import Svg, { Rect, G, Path, Line, Circle } from 'react-native-svg';
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
  ScrollView,
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
  const dismissKeyboard = () => {
    setShowLiftDropdown(false);
    Keyboard.dismiss();
  };
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const fmt2 = (n: number) => {
    const rounded = Math.round(n * 100) / 100;
    const str = rounded.toFixed(2);
    return str.replace(/\.?0+$/, '');
  };
  const Icon = ({
    name,
    size = 18,
    color = '#fff',
  }: { name: 'plus' | 'edit' | 'check' | 'close' | 'caretUp' | 'caretDown' | 'gear' | 'barbell'; size?: number; color?: string }) => {
    const strokeWidth = 3;
    switch (name) {
      case 'plus':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </Svg>
        );
      case 'edit':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.12l-1.88-1.88a1.5 1.5 0 0 0-2.12 0L4 16v4z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
      case 'check':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              d="M5 13l4 4L19 7"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
      case 'close':
      default:
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </Svg>
        );
      case 'caretDown':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              d="M6 10l6 6 6-6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
      case 'caretUp':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              d="M6 14l6-6 6 6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
      case 'gear':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth={strokeWidth} fill="none" />
            {/* Subtle nubs */}
            <Line x1="12" y1="2.5" x2="12" y2="4.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="12" y1="19.8" x2="12" y2="21.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="2.5" y1="12" x2="4.2" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="19.8" y1="12" x2="21.5" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="5.5" y1="5.5" x2="6.8" y2="6.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="18.5" y1="5.5" x2="17.2" y2="6.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="5.5" y1="18.5" x2="6.8" y2="17.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="18.5" y1="18.5" x2="17.2" y2="17.2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </Svg>
        );
      case 'barbell':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path
              d="M4 9v6M6 7v10M18 7v10M20 9v6M6 12h12"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        );
    }
  };
  const addLift = () => {
    const cleanName = newLiftName.trim();
    const weightNum = parseInt(newLiftWeight, 10);
    if (!cleanName || isNaN(weightNum) || weightNum <= 0) return;
    setLifts((prev) => [...prev, { id: `${Date.now()}`, name: cleanName, weight: weightNum }]);
    setNewLiftName('');
    setNewLiftWeight('');
  };

  const deleteLift = (id: string) => {
    setLifts((prev) => prev.filter((l) => l.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingWeight('');
    }
  };

  const startEditLift = (id: string, weight: number) => {
    setEditingId(id);
    setEditingWeight(String(weight));
  };

  const saveEditLift = () => {
    if (!editingId) return;
    const val = parseInt(editingWeight, 10);
    if (isNaN(val) || val <= 0) return;
    setLifts((prev) => prev.map((l) => (l.id === editingId ? { ...l, weight: val } : l)));
    setEditingId(null);
    setEditingWeight('');
  };

  const handleSelectLiftWeight = (weightVal: number) => {
    setWeight(String(weightVal));
    setShowLiftDropdown(false);
    dismissKeyboard();
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
  const [showLiftsModal, setShowLiftsModal] = useState(false);
  const [bodyweight, setBodyweight] = useState('');
  const [showBwMultiple, setShowBwMultiple] = useState(false);
  const [warmupPct, setWarmupPct] = useState(40);
  const [lifts, setLifts] = useState<{ id: string; name: string; weight: number }[]>([]);
  const [newLiftName, setNewLiftName] = useState('');
  const [newLiftWeight, setNewLiftWeight] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWeight, setEditingWeight] = useState('');
  const [showLiftDropdown, setShowLiftDropdown] = useState(false);
  const [disabledPlates, setDisabledPlates] = useState<number[]>([]);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load last used barbell type on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('barbellWeight');
        if (stored) setBarbellWeight(Number(stored));
        const storedSide = await AsyncStorage.getItem('barSide');
        if (storedSide === 'left' || storedSide === 'right') setBarSide(storedSide);
        const storedBw = await AsyncStorage.getItem('bodyweight');
        if (storedBw) setBodyweight(storedBw);
        const storedBwToggle = await AsyncStorage.getItem('showBwMultiple');
        if (storedBwToggle === 'true') setShowBwMultiple(true);
        const storedWarmup = await AsyncStorage.getItem('warmupPct');
        if (storedWarmup && !isNaN(Number(storedWarmup))) setWarmupPct(Number(storedWarmup));
        const storedLifts = await AsyncStorage.getItem('lifts');
        if (storedLifts) {
          try {
            const parsed = JSON.parse(storedLifts);
            if (Array.isArray(parsed)) setLifts(parsed);
          } catch {}
        }
        const storedDisabled = await AsyncStorage.getItem('disabledPlates');
        if (storedDisabled) {
          try {
            const parsed = JSON.parse(storedDisabled);
            if (Array.isArray(parsed)) setDisabledPlates(parsed);
          } catch {}
        }
        setHydrated(true);
      } catch {}
    })();
  }, []);

  // Save barbell type when changed
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('barbellWeight', String(barbellWeight));
  }, [hydrated, barbellWeight]);
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('barSide', barSide);
  }, [hydrated, barSide]);
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('bodyweight', bodyweight);
  }, [hydrated, bodyweight]);
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('showBwMultiple', showBwMultiple ? 'true' : 'false');
  }, [hydrated, showBwMultiple]);
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('warmupPct', String(warmupPct));
  }, [hydrated, warmupPct]);
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('lifts', JSON.stringify(lifts));
  }, [hydrated, lifts]);
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('disabledPlates', JSON.stringify(disabledPlates));
  }, [hydrated, disabledPlates]);

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
    { weight: 1, color: '#7a0f0f', label: '1kg (dark red)' },
    { weight: 0.75, color: '#0f3d0f', label: '0.75kg (dark green)' },
    { weight: 0.5, color: '#0b234f', label: '0.5kg (dark blue)' },
    { weight: 0.25, color: '#b8b8b8', label: '0.25kg (white)' },
  ];
  const enabledPlateOptions = plateOptions.filter((p) => !disabledPlates.includes(p.weight));

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
          const totalSingleSet = enabledPlateOptions.reduce((sum, p) => sum + p.weight, 0);
          const plateCounts: { [weight: number]: { color: string; count: number } } = {};
          const baseCounts: { [weight: number]: number } = {}; // counts that must be preserved (the “one of each” set)
          const epsilon = 0.0001; // float guard
          const addPlateCount = (plateWeight: number, delta: number) => {
            if (delta === 0) return;
            const plate = enabledPlateOptions.find((p) => p.weight === plateWeight)!;
            if (!plateCounts[plateWeight]) {
              plateCounts[plateWeight] = { color: plate.color, count: 0 };
            }
            plateCounts[plateWeight].count += delta;
          };

          if (weightNeeded <= totalSingleSet + epsilon) {
            // Greedy without duplicates (max 1 each)
            let remaining = weightNeeded;
            for (const plate of enabledPlateOptions) {
              if (remaining + epsilon >= plate.weight) {
                addPlateCount(plate.weight, 1);
                remaining = Math.round((remaining - plate.weight) * 100) / 100;
              }
            }
          } else {
            // Phase A: one of each (record as base that should not be consolidated away)
            enabledPlateOptions.forEach((plate) => {
              addPlateCount(plate.weight, 1);
              baseCounts[plate.weight] = 1;
            });
            // Phase B: greedy duplicates on the remainder
            let remaining = Math.round((weightNeeded - totalSingleSet) * 100) / 100;
            for (const plate of enabledPlateOptions) {
              if (remaining + epsilon < plate.weight) continue;
              const extra = Math.floor((remaining + epsilon) / plate.weight);
              if (extra > 0) {
                addPlateCount(plate.weight, extra);
                remaining = Math.round((remaining - plate.weight * extra) * 100) / 100;
              }
            }

            // Consolidate only EXCESS small-plate pairs upward; never consume the base 1-per-plate set.
            const ascWeights = [...enabledPlateOptions].map((p) => p.weight).reverse(); // lightest -> heaviest
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

          return enabledPlateOptions
            .filter((p) => plateCounts[p.weight])
            .map((p) => ({ weight: p.weight, color: p.color, count: plateCounts[p.weight].count }));
        }

  const platesPerSide = weightPerSide > 0 ? calculatePlates(weightPerSide) : [];
  const actualPerSide = platesPerSide.reduce((sum, p) => sum + p.weight * p.count, 0);
  const actualTotal = barbellWeight + actualPerSide * 2;
  const mismatch = round2(actualTotal - targetWeight);
  const bwNumber = parseInt(bodyweight, 10) || 0;
  const bwMultiple = bwNumber > 0 ? round2(targetWeight / bwNumber) : 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} disabled={showLiftDropdown}>
      <View style={[styles.container, styles.darkBg, { paddingTop: 14 + insets.top }]}>
      {/* Header actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, borderLeftColor: '#444', borderLeftWidth: 4, paddingLeft: 12 }}>
        <Text style={styles.headerTitle}>ARRR Bar</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              dismissKeyboard();
              setShowLiftsModal(true);
            }}
            style={[styles.iconButton, { backgroundColor: '#444' }]}
          >
            <Icon name="barbell" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              dismissKeyboard();
              setShowSettings(true);
            }}
            style={[styles.iconButton, { backgroundColor: '#444' }]}
          >
            <Icon name="gear" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weight input label above field */}
        <View style={[styles.topRow]}>
          <View style={[styles.topFieldColumn]}>
            <Text style={styles.label}>1RM Weight:</Text>
          <TextInput
            style={[styles.input, styles.darkInput, { width: 80 }]}
            keyboardType="numeric"
            value={weight}
            onChangeText={handleWeightInput}
            onFocus={() => {
              setShowLiftDropdown(true);
              setWeight('');
            }}
            placeholder="kg"
            placeholderTextColor="#888"
            maxLength={6}
          />
          {showLiftDropdown && lifts.length > 0 && (
            <Pressable
              style={styles.dropdown}
              onPress={(e) => e.stopPropagation()}
            >
              <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                {lifts.map((lift) => (
                  <TouchableOpacity
                    key={lift.id}
                    style={styles.dropdownItem}
                    onPress={() => handleSelectLiftWeight(lift.weight)}
                  >
                    <Text style={{ color: '#fff' }}>
                      {lift.name}: {lift.weight} kg
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          )}
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
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, { width: 280 }]}>
            <Text style={[styles.label, { marginBottom: 12 }]}>Settings</Text>
            <View style={[styles.modalItem, { width: 220, alignItems: 'flex-start' }]}>
              <Text style={[styles.value, { fontSize: 16, marginBottom: 6 }]}>Bodyweight (kg)</Text>
              <TextInput
                style={[styles.input, styles.darkInput, { width: '100%', marginBottom: 0 }]}
                value={bodyweight}
                onChangeText={(t) => {
                  const numeric = t.replace(/[^0-9]/g, '');
                  const val = parseInt(numeric, 10);
                  if (isNaN(val)) {
                    setBodyweight('');
                  } else {
                    setBodyweight(String(Math.min(val, 300)));
                  }
                }}
                keyboardType="numeric"
                placeholder="Enter bodyweight"
                placeholderTextColor="#777"
              />
            </View>
            <View
              style={[
                styles.modalItem,
                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 220 },
              ]}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.value, { fontSize: 15 }]}>Show BW multiplier</Text>
              </View>
              <Switch
                value={showBwMultiple}
                onValueChange={setShowBwMultiple}
                trackColor={{ false: '#555', true: '#6ddf7a' }}
                thumbColor="#fff"
              />
            </View>
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
          </Pressable>
        </Pressable>
      </Modal>

      {/* Lifts modal */}
      <Modal visible={showLiftsModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowLiftsModal(false);
            dismissKeyboard();
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, { width: 340 }]}>
            <Text style={[styles.label, { marginBottom: 12 }]}>Saved Lifts</Text>
            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 10, alignItems: 'center' }}>
              <TextInput
                style={[styles.input, styles.darkInput, { flex: 1, marginRight: 8 }]}
                value={newLiftName}
                onChangeText={setNewLiftName}
                placeholder="Lift name"
                placeholderTextColor="#777"
              />
              <TextInput
                style={[styles.input, styles.darkInput, { width: 90 }]}
                value={newLiftWeight}
                onChangeText={(t) => setNewLiftWeight(t.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="1RM"
                placeholderTextColor="#777"
              />
              <TouchableOpacity style={[styles.iconButton, { marginLeft: 6 }]} onPress={addLift}>
                <Icon name="plus" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 260, width: '100%', marginTop: 8 }}>
              {lifts.map((lift) => (
                <View
                  key={lift.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{lift.name}</Text>
                    {editingId === lift.id ? (
                      <TextInput
                        style={[styles.input, styles.darkInput, { width: 110, marginTop: 4, marginBottom: 0 }]}
                        value={editingWeight}
                        onChangeText={(t) => setEditingWeight(t.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={{ color: '#ccc', fontSize: 14 }}>{lift.weight} kg</Text>
                    )}
                  </View>
                  {editingId === lift.id ? (
                    <TouchableOpacity style={[styles.iconButton]} onPress={saveEditLift}>
                      <Icon name="check" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.iconButton]}
                      onPress={() => startEditLift(lift.id, lift.weight)}
                    >
                      <Icon name="edit" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.iconButton, { marginLeft: 4, backgroundColor: '#8b2a2a' }]}
                    onPress={() => deleteLift(lift.id)}
                  >
                    <Icon name="close" />
                  </TouchableOpacity>
                </View>
              ))}
              {lifts.length === 0 && <Text style={{ color: '#777' }}>No lifts added yet.</Text>}
            </ScrollView>

          </Pressable>
        </Pressable>
      </Modal>

      {/* Disable plates modal triggered from bar visual */}
      <Modal visible={showDisableModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowDisableModal(false);
            dismissKeyboard();
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalContent, { width: 380 }]}>
            <Text style={[styles.label, { marginBottom: 12 }]}>Enable / Disable Plates</Text>
            <ScrollView style={{ maxHeight: 300, width: '100%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                {[ [25, 20, 15, 10, 5], [2.5, 1.25, 1, 0.75, 0.5, 0.25] ].map((col, idx) => (
                  <View key={idx} style={{ flex: 1, gap: 10 }}>
                    {col.map((w) => {
                      const plate = plateOptions.find((p) => p.weight === w);
                      if (!plate) return null;
                      const disabled = disabledPlates.includes(plate.weight);
                      return (
                        <TouchableOpacity
                          key={plate.weight}
                          onPress={() =>
                            setDisabledPlates((prev) =>
                              disabled ? prev.filter((weight) => weight !== plate.weight) : [...prev, plate.weight]
                            )
                          }
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                            backgroundColor: disabled ? '#3a2a2a' : '#2f2f2f',
                            borderWidth: 1,
                            borderColor: disabled ? '#8b2a2a' : '#444',
                          }}
                        >
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 2,
                              backgroundColor: plate.color,
                              marginRight: 8,
                              borderWidth: 1,
                              borderColor: '#222',
                              opacity: disabled ? 0.4 : 1,
                            }}
                          />
                          <Text style={{ color: disabled ? '#aaa' : '#fff', fontSize: 15 }}>{plate.weight}kg</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

        {/* Barbell weight toggle moved inline above */}

      {/* Barbell visual (tap to manage plate availability) */}
        <Pressable
          onPress={() => {
            dismissKeyboard();
            setShowDisableModal(true);
          }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}
        >
          <BarbellVisual
            plates={platesPerSide}
            width={Math.max(320, screenWidth - 48)}
            canvasWidth={screenWidth}
            flipped={barSide === 'left'}
          />
        </Pressable>

      <View style={{ marginVertical: 16, minHeight: 180, justifyContent: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#fff' }}>Target: {fmt2(targetWeight)} kg</Text>
          {showBwMultiple && bwNumber > 0 && (
              <Text style={{ color: '#9ad0ff', fontSize: 16, marginLeft: 10 }}>
                ({fmt2(bwMultiple)}x BW)
              </Text>
          )}
        </View>
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
          <View style={{ marginLeft: 6 }}>
            <Icon name={showPlateList ? 'caretUp' : 'caretDown'} size={18} color="#ccc" />
          </View>
        </TouchableOpacity>

        {showPlateList && (() => {
          const tallWeights = new Set([25, 20, 15, 10]);
          const tallList = platesPerSide.filter((p) => tallWeights.has(p.weight));
          const shortList = platesPerSide.filter((p) => !tallWeights.has(p.weight));
          const renderList = (list: typeof platesPerSide, emptyText: string) =>
            list.length === 0 ? (
              <Text style={{ color: '#888', fontSize: 16 }}>{emptyText}</Text>
            ) : (
              list.map((p) => (
                <View
                  key={`${p.weight}-${p.count}`}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
                >
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 2,
                      backgroundColor: p.color,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: '#222',
                    }}
                  />
                  <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>
                    {p.count}x {p.weight}kg
                  </Text>
                </View>
              ))
            );

          return (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>{renderList(tallList, 'No tall plates')}</View>
              <View style={{ flex: 1 }}>{renderList(shortList, 'No small plates')}</View>
            </View>
          );
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
  canvasWidth,
  flipped = false,
}: {
  plates: { weight: number; color: string; count: number }[];
  width?: number;
  canvasWidth?: number;
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
    1: basePlateHeight * 0.3,
    0.75: basePlateHeight * 0.3,
    0.5: basePlateHeight * 0.3,
    0.25: basePlateHeight * 0.3,
  };
  const height = basePlateHeight + 40; // add padding for centering
  const stopWidth = 10;
  const endWidth = 20;
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
    1: 15,
    0.75: 15,
    0.5: 15,
    0.25: 15,
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

  // Start position: flush to the stop on the chosen side (do not move plates)
  let x = flipped ? endWidth + stopWidth : width - endWidth - stopWidth - totalPlateWidth;
  const barExtend = 60; // only extend on weighted side
  const svgW = canvasWidth && canvasWidth > width ? canvasWidth : width + barExtend;
  const offsetX = (svgW - width) / 2;

  return (
    <Svg width={svgW} height={height}>
      <G transform={`translate(${offsetX},0)`}>
        {/* Bar (horizontal) */}
        <Rect
          x={0}
          y={height / 2 - barThickness / 2}
          width={width}
          height={barThickness}
          fill={barColor}
          rx={barThickness / 4} // slight rounding
        />
        {/* Bar extension only on weighted side */}
        <Rect
          x={flipped ? -barExtend : width}
          y={height / 2 - barThickness / 2}
          width={barExtend}
          height={barThickness}
          fill={barColor}
        />
        {/* Bar end (right or left depending on flip) */}
        <Rect
          x={flipped ? 0 : width - endWidth}
          y={height / 2 - barThickness}
          width={endWidth * 1.5}
          height={barThickness * 2}
          fill={'#666'}
          rx={6}
        />
        {/* Plates (largest to smallest, flush to stop) */}
        <G>
          {(() => {
            const renderPlates = flipped ? plates : [...plates].reverse();
            const rects: JSX.Element[] = [];
            let plateX = x;
            renderPlates.forEach((p) => {
              const thickness = plateThicknessMap[p.weight] || 8;
              const plateHeight = plateHeightMap[p.weight] || basePlateHeight;
              for (let j = 0; j < p.count; j++) {
                rects.push(
                  <Rect
                    key={`${flipped ? 'L' : 'R'}-${p.weight}-${j}-${thickness}-${plateHeight}`}
                    x={plateX}
                    y={height / 2 - plateHeight / 2}
                    width={thickness}
                    height={plateHeight}
                    fill={p.weight === 15 ? '#FFD600' : p.color}
                    stroke={p.weight <= 1.25 ? '#fff' : '#222'}
                    strokeWidth={1}
                    rx={thickness / 3}
                  />
                );
                plateX += thickness;
              }
            });
            return rects;
          })()}
        </G>
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
  headerTitle: {
    color: '#505050',
    fontSize: 35,
    lineHeight: 30,
    fontWeight: '900',
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
    marginTop: 16,
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
    marginBottom: 0,
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
  dropdown: {
    position: 'absolute',
    top: 82,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 10,
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  iconButton: {
    backgroundColor: '#595959',
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
