import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Dimensions, Image, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { X, Trash2 } from 'lucide-react-native';

interface DrawingPoint {
  x: number;
  y: number;
}

interface ImageDrawingProps {
  imageUrl: string;
  drawingData?: string;
  onSave: (drawingData: string) => void;
  onClose: () => void;
  visible: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ImageDrawing: React.FC<ImageDrawingProps> = ({
  imageUrl,
  drawingData,
  onSave,
  onClose,
  visible
}) => {
  const [paths, setPaths] = useState<DrawingPoint[][]>(() => {
    try {
      return drawingData ? JSON.parse(drawingData) : [];
    } catch {
      return [];
    }
  });
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<View>(null);
  const drawingViewRef = useRef<any>(null);

  useEffect(() => {
    if (visible && drawingData) {
      try {
        setPaths(JSON.parse(drawingData));
      } catch {
        setPaths([]);
      }
    } else if (!visible) {
      setPaths([]);
      setCurrentPath([]);
      setIsDrawing(false);
    }
  }, [visible, drawingData]);

  const getCoordinates = (event: any) => {
    if (Platform.OS === 'web') {
      // Web: use clientX/clientY relative to container
      const nativeEvent = event.nativeEvent || event;
      const target = nativeEvent.target || event.target;
      
      if (target && target.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        return {
          x: nativeEvent.clientX - rect.left,
          y: nativeEvent.clientY - rect.top
        };
      }
      
      // Fallback: try to get from event directly
      if (nativeEvent.locationX !== undefined) {
        return {
          x: nativeEvent.locationX,
          y: nativeEvent.locationY
        };
      }
      
      // Last resort: use pageX/pageY
      if (nativeEvent.pageX !== undefined && containerRef.current) {
        // This is a rough approximation
        return {
          x: nativeEvent.pageX,
          y: nativeEvent.pageY
        };
      }
      
      return { x: 0, y: 0 };
    } else {
      // Mobile: use locationX/locationY
      return {
        x: event.nativeEvent.locationX,
        y: event.nativeEvent.locationY
      };
    }
  };

  const handleStart = (event: any) => {
    event.preventDefault?.();
    const coords = getCoordinates(event);
    setIsDrawing(true);
    setCurrentPath([coords]);
  };

  const handleMove = (event: any) => {
    if (!isDrawing) return;
    event.preventDefault?.();
    const coords = getCoordinates(event);
    setCurrentPath(prev => [...prev, coords]);
  };

  const handleEnd = (event?: any) => {
    if (event) event.preventDefault?.();
    if (currentPath.length > 0) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const handleSave = () => {
    const allPaths = [...paths, ...(currentPath.length > 0 ? [currentPath] : [])];
    onSave(JSON.stringify(allPaths));
  };

  const pathToSvgPath = (path: DrawingPoint[]): string => {
    if (path.length === 0) return '';
    if (path.length === 1) {
      return `M ${path[0].x} ${path[0].y} L ${path[0].x} ${path[0].y}`;
    }
    return path.map((point, index) => 
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
    ).join(' ');
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Draw on Image</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          ref={containerRef}
          style={styles.imageContainer}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setImageSize({ width, height });
          }}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
            pointerEvents="none"
          />
          
          <View 
            ref={drawingViewRef}
            style={[
              StyleSheet.absoluteFill,
              Platform.OS === 'web' && styles.webDrawingView
            ]}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            {...(Platform.OS === 'web' ? {
              onMouseDown: handleStart,
              onMouseMove: handleMove,
              onMouseUp: handleEnd,
              onMouseLeave: handleEnd,
            } : {})}
          >
            <Svg
              width={imageSize.width || SCREEN_WIDTH}
              height={imageSize.height || SCREEN_HEIGHT}
              style={styles.svg}
            >
              {paths.map((path, index) => (
                <Path
                  key={index}
                  d={pathToSvgPath(path)}
                  stroke="#ff0000"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath.length > 0 && (
                <Path
                  d={pathToSvgPath(currentPath)}
                  stroke="#ff0000"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  webDrawingView: {
    cursor: 'crosshair',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  } as any,
});
