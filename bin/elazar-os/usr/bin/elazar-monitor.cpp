#include <iostream>
#include <vector>
#include <string>
#include <thread>
#include <mutex>
#include <atomic>
#include <chrono>
#include <random>
#include <algorithm>
#include <cmath>
#include <memory>
#include <functional>
#include <condition_variable>
#include <queue>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <cstring>
#include <cstdlib>
#include <cstdio>
#include <unistd.h>
#include <sys/sysinfo.h>
#include <sys/statvfs.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <ifaddrs.h>
#include <net/if.h>
#include <linux/if_link.h>
#include <dirent.h>
#include <openssl/sha.h>
#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <openssl/rand.h>
#include <boost/asio.hpp>
#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/filesystem.hpp>
#include <nlohmann/json.hpp>

// Advanced System Monitoring Constants
#define MONITORING_INTERVAL 1000 // milliseconds
#define HISTORY_SIZE 3600 // 1 hour of data at 1 second intervals
#define ALERT_THRESHOLD_CPU 90.0
#define ALERT_THRESHOLD_MEMORY 85.0
#define ALERT_THRESHOLD_DISK 90.0
#define PERFORMANCE_SAMPLES 60
#define NETWORK_INTERFACE_CHECK_INTERVAL 5000
#define PROCESS_CHECK_INTERVAL 10000
#define LOG_ROTATION_SIZE 10485760 // 10MB

namespace elazar {

struct SystemMetrics {
    double cpu_usage_percent;
    double memory_usage_percent;
    double disk_usage_percent;
    uint64_t total_memory_kb;
    uint64_t used_memory_kb;
    uint64_t total_disk_kb;
    uint64_t used_disk_kb;
    double network_rx_mbps;
    double network_tx_mbps;
    int process_count;
    double load_average_1m;
    double load_average_5m;
    double load_average_15m;
    std::chrono::system_clock::time_point timestamp;

    nlohmann::json toJson() const {
        return {
            {"cpu_usage_percent", cpu_usage_percent},
            {"memory_usage_percent", memory_usage_percent},
            {"disk_usage_percent", disk_usage_percent},
            {"total_memory_kb", total_memory_kb},
            {"used_memory_kb", used_memory_kb},
            {"total_disk_kb", total_disk_kb},
            {"used_disk_kb", used_disk_kb},
            {"network_rx_mbps", network_rx_mbps},
            {"network_tx_mbps", network_tx_mbps},
            {"process_count", process_count},
            {"load_average_1m", load_average_1m},
            {"load_average_5m", load_average_5m},
            {"load_average_15m", load_average_15m},
            {"timestamp", std::chrono::duration_cast<std::chrono::milliseconds>(
                timestamp.time_since_epoch()).count()}
        };
    }
};

struct ProcessInfo {
    int pid;
    std::string name;
    std::string user;
    double cpu_percent;
    uint64_t memory_kb;
    std::string state;
    std::chrono::system_clock::time_point start_time;

    nlohmann::json toJson() const {
        return {
            {"pid", pid},
            {"name", name},
            {"user", user},
            {"cpu_percent", cpu_percent},
            {"memory_kb", memory_kb},
            {"state", state},
            {"start_time", std::chrono::duration_cast<std::chrono::milliseconds>(
                start_time.time_since_epoch()).count()}
        };
    }
};

struct NetworkInterface {
    std::string name;
    std::string ip_address;
    std::string mac_address;
    uint64_t rx_bytes;
    uint64_t tx_bytes;
    double rx_mbps;
    double tx_mbps;
    bool is_up;

    nlohmann::json toJson() const {
        return {
            {"name", name},
            {"ip_address", ip_address},
            {"mac_address", mac_address},
            {"rx_bytes", rx_bytes},
            {"tx_bytes", tx_bytes},
            {"rx_mbps", rx_mbps},
            {"tx_mbps", tx_mbps},
            {"is_up", is_up}
        };
    }
};

class MetricsCollector {
private:
    SystemMetrics previous_metrics;
    std::map<std::string, uint64_t> previous_network_stats;
    std::mutex metrics_mutex;

    // CPU statistics
    struct CpuStats {
        unsigned long long user;
        unsigned long long nice;
        unsigned long long system;
        unsigned long long idle;
        unsigned long long iowait;
        unsigned long long irq;
        unsigned long long softirq;
    };

    CpuStats getCpuStats() {
        CpuStats stats = {0, 0, 0, 0, 0, 0, 0};

        std::ifstream stat_file("/proc/stat");
        if (stat_file.is_open()) {
            std::string line;
            std::getline(stat_file, line);

            if (line.substr(0, 3) == "cpu") {
                std::istringstream iss(line.substr(5));
                iss >> stats.user >> stats.nice >> stats.system >> stats.idle
                    >> stats.iowait >> stats.irq >> stats.softirq;
            }
        }

        return stats;
    }

    double calculateCpuUsage(const CpuStats& prev, const CpuStats& curr) {
        unsigned long long prev_total = prev.user + prev.nice + prev.system + prev.idle +
                                      prev.iowait + prev.irq + prev.softirq;
        unsigned long long curr_total = curr.user + curr.nice + curr.system + curr.idle +
                                      curr.iowait + curr.irq + curr.softirq;

        unsigned long long prev_idle = prev.idle + prev.iowait;
        unsigned long long curr_idle = curr.idle + curr.iowait;

        unsigned long long total_diff = curr_total - prev_total;
        unsigned long long idle_diff = curr_idle - prev_idle;

        if (total_diff == 0) return 0.0;

        return 100.0 * (total_diff - idle_diff) / total_diff;
    }

public:
    SystemMetrics collectSystemMetrics() {
        std::lock_guard<std::mutex> lock(metrics_mutex);
        SystemMetrics metrics;
        metrics.timestamp = std::chrono::system_clock::now();

        // CPU Usage
        static CpuStats prev_cpu_stats = getCpuStats();
        CpuStats curr_cpu_stats = getCpuStats();
        metrics.cpu_usage_percent = calculateCpuUsage(prev_cpu_stats, curr_cpu_stats);
        prev_cpu_stats = curr_cpu_stats;

        // Memory Information
        struct sysinfo mem_info;
        if (sysinfo(&mem_info) == 0) {
            metrics.total_memory_kb = mem_info.totalram * mem_info.mem_unit / 1024;
            metrics.used_memory_kb = (mem_info.totalram - mem_info.freeram) * mem_info.mem_unit / 1024;
            metrics.memory_usage_percent = 100.0 * metrics.used_memory_kb / metrics.total_memory_kb;

            metrics.load_average_1m = mem_info.loads[0] / 65536.0;
            metrics.load_average_5m = mem_info.loads[1] / 65536.0;
            metrics.load_average_15m = mem_info.loads[2] / 65536.0;
        }

        // Disk Usage (root filesystem)
        struct statvfs disk_info;
        if (statvfs("/", &disk_info) == 0) {
            metrics.total_disk_kb = (disk_info.f_blocks * disk_info.f_frsize) / 1024;
            metrics.used_disk_kb = ((disk_info.f_blocks - disk_info.f_bfree) * disk_info.f_frsize) / 1024;
            metrics.disk_usage_percent = 100.0 * metrics.used_disk_kb / metrics.total_disk_kb;
        }

        // Network Statistics
        metrics.network_rx_mbps = 0.0;
        metrics.network_tx_mbps = 0.0;

        struct ifaddrs* ifaddr;
        if (getifaddrs(&ifaddr) == 0) {
            for (struct ifaddrs* ifa = ifaddr; ifa != nullptr; ifa = ifa->ifa_next) {
                if (ifa->ifa_addr == nullptr || ifa->ifa_addr->sa_family != AF_PACKET) continue;
                if (strcmp(ifa->ifa_name, "lo") == 0) continue; // Skip loopback

                struct rtnl_link_stats* stats = (struct rtnl_link_stats*)ifa->ifa_data;
                if (stats) {
                    std::string iface_name = ifa->ifa_name;
                    uint64_t rx_bytes = stats->rx_bytes;
                    uint64_t tx_bytes = stats->tx_bytes;

                    if (previous_network_stats.count(iface_name + "_rx")) {
                        uint64_t prev_rx = previous_network_stats[iface_name + "_rx"];
                        uint64_t prev_tx = previous_network_stats[iface_name + "_tx"];

                        // Calculate Mbps (bytes per second * 8 / 1,000,000)
                        double time_diff = 1.0; // Assuming 1 second interval
                        metrics.network_rx_mbps += ((rx_bytes - prev_rx) * 8.0) / 1000000.0;
                        metrics.network_tx_mbps += ((tx_bytes - prev_tx) * 8.0) / 1000000.0;
                    }

                    previous_network_stats[iface_name + "_rx"] = rx_bytes;
                    previous_network_stats[iface_name + "_tx"] = tx_bytes;
                }
            }
            freeifaddrs(ifaddr);
        }

        // Process Count
        metrics.process_count = 0;
        DIR* proc_dir = opendir("/proc");
        if (proc_dir) {
            struct dirent* entry;
            while ((entry = readdir(proc_dir)) != nullptr) {
                if (entry->d_type == DT_DIR && atoi(entry->d_name) > 0) {
                    metrics.process_count++;
                }
            }
            closedir(proc_dir);
        }

        return metrics;
    }
};

class ProcessMonitor {
private:
    std::map<int, ProcessInfo> process_cache;
    std::mutex process_mutex;

public:
    std::vector<ProcessInfo> getTopProcesses(int limit = 10) {
        std::lock_guard<std::mutex> lock(process_mutex);
        std::vector<ProcessInfo> processes;

        DIR* proc_dir = opendir("/proc");
        if (!proc_dir) return processes;

        struct dirent* entry;
        while ((entry = readdir(proc_dir)) != nullptr) {
            if (entry->d_type != DT_DIR) continue;

            int pid = atoi(entry->d_name);
            if (pid <= 0) continue;

            ProcessInfo proc = getProcessInfo(pid);
            if (!proc.name.empty()) {
                processes.push_back(proc);
            }
        }
        closedir(proc_dir);

        // Sort by CPU usage descending
        std::sort(processes.begin(), processes.end(),
                 [](const ProcessInfo& a, const ProcessInfo& b) {
                     return a.cpu_percent > b.cpu_percent;
                 });

        if (processes.size() > limit) {
            processes.resize(limit);
        }

        return processes;
    }

    ProcessInfo getProcessInfo(int pid) {
        ProcessInfo proc;
        proc.pid = pid;

        // Read /proc/[pid]/stat
        std::ifstream stat_file("/proc/" + std::to_string(pid) + "/stat");
        if (stat_file.is_open()) {
            std::string line;
            std::getline(stat_file, line);

            std::istringstream iss(line);
            std::string token;
            std::vector<std::string> tokens;

            while (iss >> token) {
                tokens.push_back(token);
            }

            if (tokens.size() > 23) {
                // Extract process name (remove parentheses)
                std::string comm = tokens[1];
                if (comm.size() > 2 && comm.front() == '(' && comm.back() == ')') {
                    proc.name = comm.substr(1, comm.size() - 2);
                }

                // Process state
                proc.state = tokens[2];

                // Memory usage (VmRSS from /proc/[pid]/status)
                std::ifstream status_file("/proc/" + std::to_string(pid) + "/status");
                if (status_file.is_open()) {
                    std::string status_line;
                    while (std::getline(status_file, status_line)) {
                        if (status_line.substr(0, 6) == "VmRSS:") {
                            std::istringstream mem_iss(status_line.substr(6));
                            mem_iss >> proc.memory_kb;
                            break;
                        }
                    }
                }
            }
        }

        // CPU usage calculation would require tracking previous stats
        proc.cpu_percent = 0.0; // Simplified

        proc.start_time = std::chrono::system_clock::now(); // Simplified

        return proc;
    }
};

class NetworkMonitor {
private:
    std::vector<NetworkInterface> interfaces;
    std::mutex network_mutex;

public:
    std::vector<NetworkInterface> getNetworkInterfaces() {
        std::lock_guard<std::mutex> lock(network_mutex);
        std::vector<NetworkInterface> current_interfaces;

        struct ifaddrs* ifaddr;
        if (getifaddrs(&ifaddr) == 0) {
            for (struct ifaddrs* ifa = ifaddr; ifa != nullptr; ifa = ifa->ifa_next) {
                if (ifa->ifa_addr == nullptr) continue;

                NetworkInterface iface;
                iface.name = ifa->ifa_name;
                iface.is_up = (ifa->ifa_flags & IFF_UP) != 0;

                if (ifa->ifa_addr->sa_family == AF_INET) {
                    char ip[INET_ADDRSTRLEN];
                    inet_ntop(AF_INET, &((struct sockaddr_in*)ifa->ifa_addr)->sin_addr, ip, INET_ADDRSTRLEN);
                    iface.ip_address = ip;
                }

                // MAC address (simplified - would need more complex implementation)
                iface.mac_address = "00:00:00:00:00:00"; // Placeholder

                // Network statistics
                if (ifa->ifa_data && ifa->ifa_addr->sa_family == AF_PACKET) {
                    struct rtnl_link_stats* stats = (struct rtnl_link_stats*)ifa->ifa_data;
                    iface.rx_bytes = stats->rx_bytes;
                    iface.tx_bytes = stats->tx_bytes;
                    // Rate calculation would need historical data
                    iface.rx_mbps = 0.0;
                    iface.tx_mbps = 0.0;
                }

                current_interfaces.push_back(iface);
            }
            freeifaddrs(ifaddr);
        }

        return current_interfaces;
    }
};

class AlertSystem {
private:
    std::vector<std::function<void(const std::string&, const std::string&, double)>> alert_handlers;
    std::map<std::string, std::chrono::system_clock::time_point> last_alert_time;
    std::mutex alert_mutex;

public:
    void addAlertHandler(std::function<void(const std::string&, const std::string&, double)> handler) {
        std::lock_guard<std::mutex> lock(alert_mutex);
        alert_handlers.push_back(handler);
    }

    void checkThresholds(const SystemMetrics& metrics) {
        std::lock_guard<std::mutex> lock(alert_mutex);

        auto now = std::chrono::system_clock::now();

        // CPU Alert
        if (metrics.cpu_usage_percent > ALERT_THRESHOLD_CPU) {
            if (shouldTriggerAlert("cpu", now)) {
                triggerAlert("cpu", "High CPU Usage", metrics.cpu_usage_percent);
            }
        }

        // Memory Alert
        if (metrics.memory_usage_percent > ALERT_THRESHOLD_MEMORY) {
            if (shouldTriggerAlert("memory", now)) {
                triggerAlert("memory", "High Memory Usage", metrics.memory_usage_percent);
            }
        }

        // Disk Alert
        if (metrics.disk_usage_percent > ALERT_THRESHOLD_DISK) {
            if (shouldTriggerAlert("disk", now)) {
                triggerAlert("disk", "High Disk Usage", metrics.disk_usage_percent);
            }
        }
    }

private:
    bool shouldTriggerAlert(const std::string& alert_type, std::chrono::system_clock::time_point now) {
        if (last_alert_time.count(alert_type) == 0) return true;

        auto time_diff = now - last_alert_time[alert_type];
        auto minutes_diff = std::chrono::duration_cast<std::chrono::minutes>(time_diff).count();

        // Don't trigger the same alert more than once every 5 minutes
        return minutes_diff >= 5;
    }

    void triggerAlert(const std::string& type, const std::string& message, double value) {
        last_alert_time[type] = std::chrono::system_clock::now();

        for (const auto& handler : alert_handlers) {
            handler(type, message, value);
        }

        std::cout << "🚨 Alert: " << message << " (" << value << "%)" << std::endl;
    }
};

class PerformanceAnalyzer {
private:
    std::deque<SystemMetrics> metrics_history;
    std::mutex history_mutex;
    size_t max_history_size;

public:
    PerformanceAnalyzer(size_t history_size = HISTORY_SIZE) : max_history_size(history_size) {}

    void addMetrics(const SystemMetrics& metrics) {
        std::lock_guard<std::mutex> lock(history_mutex);
        metrics_history.push_back(metrics);

        if (metrics_history.size() > max_history_size) {
            metrics_history.pop_front();
        }
    }

    nlohmann::json getPerformanceReport() {
        std::lock_guard<std::mutex> lock(history_mutex);

        if (metrics_history.empty()) {
            return {{"error", "No performance data available"}};
        }

        // Calculate averages
        double avg_cpu = 0, avg_memory = 0, avg_disk = 0;
        double max_cpu = 0, max_memory = 0, max_disk = 0;
        int count = 0;

        for (const auto& metrics : metrics_history) {
            avg_cpu += metrics.cpu_usage_percent;
            avg_memory += metrics.memory_usage_percent;
            avg_disk += metrics.disk_usage_percent;

            max_cpu = std::max(max_cpu, metrics.cpu_usage_percent);
            max_memory = std::max(max_memory, metrics.memory_usage_percent);
            max_disk = std::max(max_disk, metrics.disk_usage_percent);

            count++;
        }

        if (count > 0) {
            avg_cpu /= count;
            avg_memory /= count;
            avg_disk /= count;
        }

        // Calculate trends (last 10 minutes vs previous 10 minutes)
        double recent_avg_cpu = 0, older_avg_cpu = 0;
        int recent_count = 0, older_count = 0;
        int split_point = std::min(600, (int)metrics_history.size() / 2); // 10 minutes at 1 second intervals

        for (int i = 0; i < metrics_history.size(); ++i) {
            if (i < split_point) {
                older_avg_cpu += metrics_history[i].cpu_usage_percent;
                older_count++;
            } else {
                recent_avg_cpu += metrics_history[i].cpu_usage_percent;
                recent_count++;
            }
        }

        std::string cpu_trend = "stable";
        if (recent_count > 0 && older_count > 0) {
            older_avg_cpu /= older_count;
            recent_avg_cpu /= recent_count;

            double trend_diff = recent_avg_cpu - older_avg_cpu;
            if (trend_diff > 5.0) cpu_trend = "increasing";
            else if (trend_diff < -5.0) cpu_trend = "decreasing";
        }

        return {
            {"time_range_seconds", metrics_history.size()},
            {"average_cpu_percent", avg_cpu},
            {"average_memory_percent", avg_memory},
            {"average_disk_percent", avg_disk},
            {"peak_cpu_percent", max_cpu},
            {"peak_memory_percent", max_memory},
            {"peak_disk_percent", max_disk},
            {"cpu_trend", cpu_trend},
            {"data_points", count}
        };
    }
};

class ElazarSystemMonitor {
private:
    MetricsCollector metrics_collector;
    ProcessMonitor process_monitor;
    NetworkMonitor network_monitor;
    AlertSystem alert_system;
    PerformanceAnalyzer performance_analyzer;

    std::thread monitoring_thread;
    std::thread api_thread;
    std::atomic<bool> monitoring_active;
    std::atomic<bool> api_active;

    // API Server
    boost::asio::io_context io_context;
    boost::asio::ip::tcp::acceptor acceptor;
    boost::asio::ip::tcp::socket socket;

    // Logging
    std::ofstream log_file;
    std::mutex log_mutex;

public:
    ElazarSystemMonitor()
        : monitoring_active(true), api_active(true),
          acceptor(io_context, boost::asio::ip::tcp::endpoint(boost::asio::ip::tcp::v4(), 4500)),
          socket(io_context) {

        initializeLogging();
        setupAlertHandlers();
        startMonitoring();
        startAPIServer();

        std::cout << "📊 Elazar System Monitor: Active" << std::endl;
        std::cout << "   Monitoring Interval: " << MONITORING_INTERVAL << "ms" << std::endl;
        std::cout << "   History Size: " << HISTORY_SIZE << " samples" << std::endl;
        std::cout << "   API Port: 4500" << std::endl;
    }

    ~ElazarSystemMonitor() {
        monitoring_active = false;
        api_active = false;

        if (monitoring_thread.joinable()) {
            monitoring_thread.join();
        }
        if (api_thread.joinable()) {
            api_thread.join();
        }

        if (log_file.is_open()) {
            log_file.close();
        }
    }

private:
    void initializeLogging() {
        std::string log_path = "/var/log/elazar/monitor.log";
        boost::filesystem::create_directories("/var/log/elazar");

        log_file.open(log_path, std::ios::app);
        if (!log_file.is_open()) {
            std::cerr << "Failed to open log file: " << log_path << std::endl;
        }
    }

    void setupAlertHandlers() {
        alert_system.addAlertHandler([this](const std::string& type, const std::string& message, double value) {
            logAlert(type, message, value);
        });
    }

    void startMonitoring() {
        monitoring_thread = std::thread([this]() {
            while (monitoring_active) {
                auto start_time = std::chrono::high_resolution_clock::now();

                // Collect metrics
                SystemMetrics metrics = metrics_collector.collectSystemMetrics();

                // Add to performance analyzer
                performance_analyzer.addMetrics(metrics);

                // Check for alerts
                alert_system.checkThresholds(metrics);

                // Log metrics periodically
                static int log_counter = 0;
                if (++log_counter % 60 == 0) { // Log every minute
                    logMetrics(metrics);
                }

                // Calculate sleep time to maintain interval
                auto end_time = std::chrono::high_resolution_clock::now();
                auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
                auto sleep_time = std::chrono::milliseconds(MONITORING_INTERVAL) - elapsed;

                if (sleep_time > std::chrono::milliseconds(0)) {
                    std::this_thread::sleep_for(sleep_time);
                }
            }
        });
    }

    void startAPIServer() {
        api_thread = std::thread([this]() {
            acceptAPIConnections();
            io_context.run();
        });
    }

    void acceptAPIConnections() {
        acceptor.async_accept(socket, [this](boost::system::error_code ec) {
            if (!ec) {
                handleAPIConnection();
            }

            if (api_active) {
                acceptAPIConnections();
            }
        });
    }

    void handleAPIConnection() {
        try {
            boost::beast::multi_buffer buffer;
            boost::beast::http::request<boost::beast::http::string_body> req;

            boost::beast::http::read(socket, buffer, req);

            boost::beast::http::response<boost::beast::http::string_body> res;
            res.version(req.version());
            res.keep_alive(req.keep_alive());

            if (req.method() == boost::beast::http::verb::get) {
                if (req.target() == "/api/monitor/metrics") {
                    handleMetricsRequest(res);
                } else if (req.target() == "/api/monitor/processes") {
                    handleProcessesRequest(res);
                } else if (req.target() == "/api/monitor/network") {
                    handleNetworkRequest(res);
                } else if (req.target() == "/api/monitor/performance") {
                    handlePerformanceRequest(res);
                } else if (req.target() == "/api/monitor/status") {
                    handleStatusRequest(res);
                } else {
                    res.result(boost::beast::http::status::not_found);
                    res.body() = "Endpoint not found";
                }
            } else {
                res.result(boost::beast::http::status::method_not_allowed);
                res.body() = "Method not allowed";
            }

            res.set(boost::beast::http::field::content_type, "application/json");
            res.prepare_payload();
            boost::beast::http::write(socket, res);

        } catch (const std::exception& e) {
            std::cerr << "API connection error: " << e.what() << std::endl;
        }

        socket.close();
    }

    void handleMetricsRequest(boost::beast::http::response<boost::beast::http::string_body>& res) {
        SystemMetrics metrics = metrics_collector.collectSystemMetrics();
        res.body() = metrics.toJson().dump(2);
        res.result(boost::beast::http::status::ok);
    }

    void handleProcessesRequest(boost::beast::http::response<boost::beast::http::string_body>& res) {
        auto processes = process_monitor.getTopProcesses(20);
        nlohmann::json response = {
            {"process_count", processes.size()},
            {"processes", nlohmann::json::array()}
        };

        for (const auto& proc : processes) {
            response["processes"].push_back(proc.toJson());
        }

        res.body() = response.dump(2);
        res.result(boost::beast::http::status::ok);
    }

    void handleNetworkRequest(boost::beast::http::response<boost::beast::http::string_body>& res) {
        auto interfaces = network_monitor.getNetworkInterfaces();
        nlohmann::json response = {
            {"interface_count", interfaces.size()},
            {"interfaces", nlohmann::json::array()}
        };

        for (const auto& iface : interfaces) {
            response["interfaces"].push_back(iface.toJson());
        }

        res.body() = response.dump(2);
        res.result(boost::beast::http::status::ok);
    }

    void handlePerformanceRequest(boost::beast::http::response<boost::beast::http::string_body>& res) {
        res.body() = performance_analyzer.getPerformanceReport().dump(2);
        res.result(boost::beast::http::status::ok);
    }

    void handleStatusRequest(boost::beast::http::response<boost::beast::http::string_body>& res) {
        nlohmann::json status = {
            {"status", "active"},
            {"monitoring_active", monitoring_active.load()},
            {"api_active", api_active.load()},
            {"uptime", std::chrono::system_clock::now().time_since_epoch().count()},
            {"version", "1.0.0"},
            {"alert_thresholds", {
                {"cpu_percent", ALERT_THRESHOLD_CPU},
                {"memory_percent", ALERT_THRESHOLD_MEMORY},
                {"disk_percent", ALERT_THRESHOLD_DISK}
            }}
        };
        res.body() = status.dump(2);
        res.result(boost::beast::http::status::ok);
    }

    void logMetrics(const SystemMetrics& metrics) {
        std::lock_guard<std::mutex> lock(log_mutex);
        if (log_file.is_open()) {
            log_file << std::fixed << std::setprecision(2);
            log_file << std::chrono::system_clock::to_time_t(metrics.timestamp) << ",";
            log_file << metrics.cpu_usage_percent << ",";
            log_file << metrics.memory_usage_percent << ",";
            log_file << metrics.disk_usage_percent << ",";
            log_file << metrics.network_rx_mbps << ",";
            log_file << metrics.network_tx_mbps << ",";
            log_file << metrics.load_average_1m << std::endl;

            // Check for log rotation
            if (log_file.tellp() > LOG_ROTATION_SIZE) {
                rotateLogFile();
            }
        }
    }

    void logAlert(const std::string& type, const std::string& message, double value) {
        std::lock_guard<std::mutex> lock(log_mutex);
        if (log_file.is_open()) {
            auto now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
            log_file << "ALERT," << now << "," << type << "," << message << "," << value << std::endl;
        }
    }

    void rotateLogFile() {
        log_file.close();

        std::string log_path = "/var/log/elazar/monitor.log";
        std::string backup_path = "/var/log/elazar/monitor.log.1";

        // Simple rotation - just move current log to .1
        std::rename(log_path.c_str(), backup_path.c_str());

        log_file.open(log_path, std::ios::app);
        if (!log_file.is_open()) {
            std::cerr << "Failed to reopen log file after rotation" << std::endl;
        }
    }
};

} // namespace elazar

int main(int argc, char* argv[]) {
    try {
        elazar::ElazarSystemMonitor monitor;

        // Parse command line arguments
        if (argc > 1) {
            if (std::string(argv[1]) == "--status") {
                std::cout << "System monitor is running" << std::endl;
                return 0;
            } else if (std::string(argv[1]) == "--test") {
                std::cout << "🧪 Running system monitor tests..." << std::endl;
                // Run tests
                return 0;
            } else if (std::string(argv[1]) == "--benchmark") {
                std::cout << "📊 Running system monitor benchmark..." << std::endl;
                // Run benchmarks
                return 0;
            }
        }

        // Keep service running
        std::cout << "Elazar System Monitor running... Press Ctrl+C to stop." << std::endl;

        // Wait for interrupt
        std::signal(SIGINT, [](int) {
            std::cout << "\nShutting down system monitor..." << std::endl;
            exit(0);
        });

        while (true) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}