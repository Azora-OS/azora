package com.azora.elazar.services;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import androidx.annotation.Nullable;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class ElazarSyncService extends Service {

    private static final String TAG = "ElazarSyncService";
    private static final String DESKTOP_SERVER_URL = "http://192.168.1.100:4210"; // Desktop IP
    private static final String BACKUP_SERVER_URL = "https://api.elazar-os.org";

    private HandlerThread handlerThread;
    private Handler handler;
    private ScheduledExecutorService syncExecutor;
    private boolean isConnected = false;

    @Override
    public void onCreate() {
        super.onCreate();

        Log.i(TAG, "ElazarSyncService created");

        // Create handler thread for background operations
        handlerThread = new HandlerThread("ElazarSyncThread");
        handlerThread.start();

        handler = new Handler(handlerThread.getLooper()) {
            @Override
            public void handleMessage(Message msg) {
                switch (msg.what) {
                    case 1:
                        performFullSync();
                        break;
                    case 2:
                        performIncrementalSync();
                        break;
                    case 3:
                        checkServerConnection();
                        break;
                }
            }
        };

        // Start periodic sync
        startPeriodicSync();
    }

    private void startPeriodicSync() {
        syncExecutor = Executors.newScheduledThreadPool(2);

        // Check server connection every 30 seconds
        syncExecutor.scheduleAtFixedRate(() -> {
            handler.sendEmptyMessage(3);
        }, 0, 30, TimeUnit.SECONDS);

        // Perform incremental sync every 5 minutes
        syncExecutor.scheduleAtFixedRate(() -> {
            if (isConnected) {
                handler.sendEmptyMessage(2);
            }
        }, 60, 300, TimeUnit.SECONDS);

        // Perform full sync every hour
        syncExecutor.scheduleAtFixedRate(() -> {
            if (isConnected) {
                handler.sendEmptyMessage(1);
            }
        }, 3600, 3600, TimeUnit.SECONDS);
    }

    private void checkServerConnection() {
        try {
            URL url = new URL(DESKTOP_SERVER_URL + "/api/status");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            int responseCode = connection.getResponseCode();
            boolean wasConnected = isConnected;
            isConnected = (responseCode == 200);

            if (isConnected && !wasConnected) {
                Log.i(TAG, "Connected to desktop Elazar OS server");
                // Perform initial sync when connection is established
                handler.sendEmptyMessage(1);
            } else if (!isConnected && wasConnected) {
                Log.w(TAG, "Lost connection to desktop Elazar OS server");
            }

            connection.disconnect();

        } catch (IOException e) {
            isConnected = false;
            Log.w(TAG, "Server connection check failed", e);
        }
    }

    private void performFullSync() {
        Log.i(TAG, "Performing full sync with desktop Elazar OS");

        try {
            // Sync AI consciousness state
            syncAIState();

            // Sync security configurations
            syncSecurityConfig();

            // Sync mining operations
            syncMiningData();

            // Sync package installations
            syncPackageData();

            // Sync system monitoring data
            syncMonitoringData();

            Log.i(TAG, "Full sync completed successfully");

        } catch (Exception e) {
            Log.e(TAG, "Full sync failed", e);
        }
    }

    private void performIncrementalSync() {
        Log.d(TAG, "Performing incremental sync");

        try {
            // Sync recent AI decisions
            syncIncrementalAI();

            // Sync security events
            syncIncrementalSecurity();

            // Sync mining statistics
            syncIncrementalMining();

        } catch (Exception e) {
            Log.e(TAG, "Incremental sync failed", e);
        }
    }

    private void syncAIState() {
        makeAPIRequest("/api/sync/ai/full", "POST", "{}");
    }

    private void syncSecurityConfig() {
        makeAPIRequest("/api/sync/security/full", "POST", "{}");
    }

    private void syncMiningData() {
        makeAPIRequest("/api/sync/mining/full", "POST", "{}");
    }

    private void syncPackageData() {
        makeAPIRequest("/api/sync/package/full", "POST", "{}");
    }

    private void syncMonitoringData() {
        makeAPIRequest("/api/sync/monitor/full", "POST", "{}");
    }

    private void syncIncrementalAI() {
        makeAPIRequest("/api/sync/ai/incremental", "POST", "{}");
    }

    private void syncIncrementalSecurity() {
        makeAPIRequest("/api/sync/security/incremental", "POST", "{}");
    }

    private void syncIncrementalMining() {
        makeAPIRequest("/api/sync/mining/incremental", "POST", "{}");
    }

    private void makeAPIRequest(String endpoint, String method, String body) {
        try {
            String serverUrl = isConnected ? DESKTOP_SERVER_URL : BACKUP_SERVER_URL;
            URL url = new URL(serverUrl + endpoint);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod(method);
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            connection.setRequestProperty("Content-Type", "application/json");

            if (body != null && !body.isEmpty()) {
                connection.setDoOutput(true);
                connection.getOutputStream().write(body.getBytes());
            }

            int responseCode = connection.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                Log.d(TAG, "Sync API request successful: " + endpoint);
            } else {
                Log.w(TAG, "Sync API request failed: " + endpoint + " - " + responseCode);
            }

            connection.disconnect();

        } catch (IOException e) {
            Log.e(TAG, "Sync API request failed: " + endpoint, e);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(TAG, "ElazarSyncService started");
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        if (syncExecutor != null) {
            syncExecutor.shutdown();
        }

        if (handlerThread != null) {
            handlerThread.quitSafely();
        }

        Log.i(TAG, "ElazarSyncService destroyed");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}