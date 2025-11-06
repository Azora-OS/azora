package com.azora.elazar;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.azora.elazar.services.DeviceTrackingService;
import com.azora.elazar.services.ElazarOfflineService;
import com.azora.elazar.services.ElazarPayjoyService;
import com.azora.elazar.services.ElazarSyncService;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.google.android.material.snackbar.Snackbar;

/**
 * Main Activity for Elazar OS Android App
 * Handles initialization, authentication, and service management
 */
public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    private static final int RC_SIGN_IN = 9001;
    private static final int PERMISSION_REQUEST_CODE = 100;

    // UI Elements
    private TextView titleText;
    private TextView statusText;
    private ProgressBar progressBar;
    private com.google.android.gms.common.SignInButton signInButton;
    private TextView deviceInfoText;

    // Google Sign-In
    private GoogleSignInClient googleSignInClient;

    // Services
    private Intent deviceTrackingIntent;
    private Intent syncIntent;
    private Intent payjoyIntent;
    private Intent offlineIntent;
    private Intent unityIntent;

    // Permissions
    private static final String[] REQUIRED_PERMISSIONS = {
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.BLUETOOTH,
        Manifest.permission.BLUETOOTH_ADMIN,
        Manifest.permission.BLUETOOTH_SCAN,
        Manifest.permission.BLUETOOTH_CONNECT,
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE,
        Manifest.permission.CAMERA,
        Manifest.permission.POST_NOTIFICATIONS
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initializeViews();
        initializeGoogleSignIn();
        initializeServices();

        // Start initialization process
        initializeElazarOS();
    }

    private void initializeViews() {
        titleText = findViewById(R.id.titleText);
        statusText = findViewById(R.id.statusText);
        progressBar = findViewById(R.id.progressBar);
        signInButton = findViewById(R.id.signInButton);
        deviceInfoText = findViewById(R.id.deviceInfoText);

        signInButton.setOnClickListener(v -> signIn());
    }

    private void initializeGoogleSignIn() {
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .requestIdToken(getString(R.string.server_client_id)) // You'll need to add this to strings.xml
            .build();

        googleSignInClient = GoogleSignIn.getClient(this, gso);
    }

    private void initializeServices() {
        deviceTrackingIntent = new Intent(this, DeviceTrackingService.class);
        syncIntent = new Intent(this, ElazarSyncService.class);
        payjoyIntent = new Intent(this, ElazarPayjoyService.class);
        offlineIntent = new Intent(this, ElazarOfflineService.class);
        unityIntent = new Intent(this, ElazarUnityService.class);
    }

    private void initializeElazarOS() {
        updateStatus("Initializing Elazar OS...");

        // Check permissions first
        if (checkPermissions()) {
            proceedWithInitialization();
        } else {
            requestPermissions();
        }
    }

    private boolean checkPermissions() {
        for (String permission : REQUIRED_PERMISSIONS) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                return false;
            }
        }
        return true;
    }

    private void requestPermissions() {
        ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, PERMISSION_REQUEST_CODE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (allGranted) {
                proceedWithInitialization();
            } else {
                updateStatus("Permissions required for full functionality");
                showSignInButton();
            }
        }
    }

    private void proceedWithInitialization() {
        updateStatus("Checking Google authentication...");

        // Check if user is already signed in
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        if (account != null) {
            onSignInSuccess(account);
        } else {
            showSignInButton();
        }
    }

    private void showSignInButton() {
        runOnUiThread(() -> {
            progressBar.setVisibility(View.GONE);
            signInButton.setVisibility(View.VISIBLE);
            updateStatus("Please sign in with Google");
        });
    }

    private void signIn() {
        Intent signInIntent = googleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            handleSignInResult(task);
        }
    }

    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            onSignInSuccess(account);
        } catch (ApiException e) {
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            onSignInFailure();
        }
    }

    private void onSignInSuccess(GoogleSignInAccount account) {
        updateStatus("Authentication successful. Starting Elazar OS services...");

        // Start all Elazar OS services
        startElazarServices();

        runOnUiThread(() -> {
            progressBar.setVisibility(View.GONE);
            signInButton.setVisibility(View.GONE);
            deviceInfoText.setVisibility(View.VISIBLE);
            updateStatus("Elazar OS Active - Device tracking enabled");
        });
    }

    private void onSignInFailure() {
        Snackbar.make(findViewById(android.R.id.content),
            "Google Sign-In failed. Please try again.",
            Snackbar.LENGTH_LONG).show();
        showSignInButton();
    }

    private void startElazarServices() {
        try {
            // Start device tracking service
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(deviceTrackingIntent);
            } else {
                startService(deviceTrackingIntent);
            }

            // Start sync service
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(syncIntent);
            } else {
                startService(syncIntent);
            }

            // Start payment service
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(payjoyIntent);
            } else {
                startService(payjoyIntent);
            }

            // Start offline service
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(offlineIntent);
            } else {
                startService(offlineIntent);
            }

            // Start unity service (cross-platform protection)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(unityIntent);
            } else {
                startService(unityIntent);
            }

            Log.d(TAG, "All Elazar OS services started successfully");

        } catch (Exception e) {
            Log.e(TAG, "Error starting Elazar OS services", e);
        }
    }

    private void updateStatus(String status) {
        runOnUiThread(() -> statusText.setText(status));
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Services will continue running in background
        Log.d(TAG, "MainActivity destroyed - services remain active");
    }
}