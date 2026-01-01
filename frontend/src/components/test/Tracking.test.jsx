import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Tracking from '../Tracking';

// Mock axios
vi.mock('axios');

// Mock Google Maps API
const mockMap = {
  fitBounds: vi.fn(),
};

const mockPolyline = {
  setMap: vi.fn(),
};

const mockMarker = {
  setPosition: vi.fn(),
  setMap: vi.fn(),
};

global.google = {
  maps: {
    geometry: {
      encoding: {
        decodePath: vi.fn((encodedPath) => [
          { lat: 37.7748, lng: -122.4193 },
          { lat: 37.7749, lng: -122.4194 },
        ]),
      },
    },
    Polyline: vi.fn(function(options) {
      return mockPolyline;
    }),
    Marker: vi.fn(function(options) {
      return mockMarker;
    }),
    LatLngBounds: vi.fn(function() {
      return {
        extend: vi.fn(),
      };
    }),
  },
};

// Mock @vis.gl/react-google-maps
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }) => <div data-testid="api-provider">{children}</div>,
  Map: ({ children }) => <div data-testid="map">{children}</div>,
  useMap: () => mockMap,
}));

describe('Tracking Component', () => {
  const mockOrder = {
    id: '123',
    status: 'in transit',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should show loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Tracking order={[mockOrder]} />);
    
    expect(screen.getByText('Loading tracking data...')).toBeInTheDocument();
  });

  it('should fetch and render tracking data', async () => {
    const mockTrackingData = {
      route: 'encodedPolylineString',
      position: { lat: 37.7749, lng: -122.4194 },
    };

    axios.get.mockResolvedValue({ data: mockTrackingData });

    render(<Tracking order={[mockOrder]} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading tracking data...')).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    expect(screen.getByTestId('map')).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/dashboard/orders/track?id=${mockOrder.id}`),
      expect.any(Object)
    );
  });

  it('should draw polyline on map when route is provided', async () => {
    const mockTrackingData = {
      route: 'encodedPolylineString',
      position: { lat: 37.7749, lng: -122.4194 },
    };

    axios.get.mockResolvedValue({ data: mockTrackingData });

    render(<Tracking order={[mockOrder]} />);

    await waitFor(() => {
      expect(google.maps.Polyline).toHaveBeenCalledWith(
        expect.objectContaining({
          strokeColor: '#2563eb',
          strokeOpacity: 0.8,
          strokeWeight: 4,
        })
      );
    });

    expect(mockMap.fitBounds).toHaveBeenCalled();
  });

  it('should create marker with position', async () => {
    const mockTrackingData = {
      route: 'encodedPolylineString',
      position: { lat: 37.7749, lng: -122.4194 },
    };

    axios.get.mockResolvedValue({ data: mockTrackingData });

    render(<Tracking order={[mockOrder]} />);

    await waitFor(() => {
      expect(google.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          position: { lat: 37.7749, lng: -122.4194 },
          title: 'current position',
        })
      );
    });
  });

  it('should poll for updates every 10 seconds', async () => {
    axios.get.mockResolvedValue({
      data: {
        route: 'encodedPolylineString',
        position: { lat: 37.7749, lng: -122.4194 },
      },
    });

    render(<Tracking order={[mockOrder]} />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    // Advance time by 10 seconds
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    // Advance another 10 seconds
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });
  });

  it('should update marker position when position changes', async () => {
    const initialPosition = { lat: 37.7749, lng: -122.4194 };
    const updatedPosition = { lat: 37.7750, lng: -122.4195 };

    axios.get
      .mockResolvedValueOnce({
        data: { route: 'encodedPolylineString', position: initialPosition },
      })
      .mockResolvedValueOnce({
        data: { route: 'encodedPolylineString', position: updatedPosition },
      });

    render(<Tracking order={[mockOrder]} />);

    await waitFor(() => {
      expect(google.maps.Marker).toHaveBeenCalled();
    });

    // Advance time to trigger next poll
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(mockMarker.setPosition).toHaveBeenCalledWith(updatedPosition);
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('API Error'));

    render(<Tracking order={[mockOrder]} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});