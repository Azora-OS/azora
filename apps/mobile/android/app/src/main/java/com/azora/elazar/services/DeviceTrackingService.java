package com.azora.elazar.services;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import java.util.HashMap;
import java.util.Map;

public class DeviceTrackingService extends Service {

    private static final String TAG = "DeviceTrackingService";
    private static final String CHANNEL_ID = "elazar_tracking";
    private static final int NOTIFICATION_ID = 1001;

    private HandlerThread handlerThread;
    private Handler handler;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothLeScanner bluetoothLeScanner;
    private ScanCallback scanCallback;

    private Map<String, BluetoothDevice> nearbyDevices = new HashMap<>();
    private Location lastLocation;

    @Override
    public void onCreate() {
        super.onCreate();

        Log.i(TAG, "DeviceTrackingService created");

        // Create notification channel
        createNotificationChannel();

        // Start foreground service
        startForeground(NOTIFICATION_ID, createNotification());

        // Initialize location tracking
        initializeLocationTracking();

        // Initialize Bluetooth tracking
        initializeBluetoothTracking();

        // Start tracking
        startTracking();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Elazar Device Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Tracks device location and nearby devices for Elazar OS");

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, com.azora.elazar.MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Elazar OS Active")
            .setContentText("Tracking location and nearby devices")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();
    }

    private void initializeLocationTracking() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) return;

                for (Location location : locationResult.getLocations()) {
                    lastLocation = location;
                    Log.i(TAG, "Location update: " + location.getLatitude() + ", " + location.getLongitude());

                    // Send location to Elazar OS server
                    sendLocationToServer(location);
                }
            }
        };
    }

    private void initializeBluetoothTracking() {
        BluetoothManager bluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = bluetoothManager.getAdapter();

        if (bluetoothAdapter != null) {
            bluetoothLeScanner = bluetoothAdapter.getBluetoothLeScanner();

            scanCallback = new ScanCallback() {
                @Override
                public void onScanResult(int callbackType, ScanResult result) {
                    BluetoothDevice device = result.getDevice();
                    String deviceAddress = device.getAddress();

                    if (!nearbyDevices.containsKey(deviceAddress)) {
                        nearbyDevices.put(deviceAddress, device);
                        Log.i(TAG, "Found nearby device: " + device.getName() + " (" + deviceAddress + ")");

                        // Send device info to server
                        sendDeviceToServer(device, result.getRssi());
                    }
                }

                @Override
                public void onScanFailed(int errorCode) {
                    Log.e(TAG, "Bluetooth scan failed: " + errorCode);
                }
            };
        }
    }

    private void startTracking() {
        // Start location tracking
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            == PackageManager.PERMISSION_GRANTED) {

            LocationRequest locationRequest = LocationRequest.create()
                .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY)
                .setInterval(10000) // 10 seconds
                .setFastestInterval(5000); // 5 seconds

            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
        }

        // Start Bluetooth scanning
        if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN)
                == PackageManager.PERMISSION_GRANTED) {

                bluetoothLeScanner.startScan(scanCallback);
            }
        }
    }

    private void sendLocationToServer(Location location) {
        // Send location data to Elazar OS server
        // This would integrate with the C++ elazar-network service
        Log.d(TAG, "Sending location to server: " + location.toString());
    }

    private void sendDeviceToServer(BluetoothDevice device, int rssi) {
        // Send nearby device data to Elazar OS server
        Log.d(TAG, "Sending device to server: " + device.getName() + " RSSI: " + rssi);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "DeviceTrackingService started");
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        // Stop location tracking
        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }

        // Stop Bluetooth scanning
        if (bluetoothLeScanner != null && scanCallback != null) {
            bluetoothLeScanner.stopScan(scanCallback);
        }

        Log.i(TAG, "DeviceTrackingService destroyed");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}