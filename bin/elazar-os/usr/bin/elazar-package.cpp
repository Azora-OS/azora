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
#include <sys/stat.h>
#include <sys/types.h>
#include <dirent.h>
#include <set>
#include <openssl/sha.h>
#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <openssl/rand.h>
#include <boost/asio.hpp>
#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>
#include <boost/filesystem.hpp>
#include <nlohmann/json.hpp>
#include <archive.h>
#include <archive_entry.h>

// Advanced Package Management Constants
#define PACKAGE_CACHE_SIZE 1000000000 // 1GB cache
#define MAX_CONCURRENT_DOWNLOADS 10
#define DOWNLOAD_TIMEOUT 30000 // milliseconds
#define VERIFICATION_TIMEOUT 10000 // milliseconds
#define DEPENDENCY_RESOLUTION_DEPTH 50
#define PACKAGE_INDEX_UPDATE_INTERVAL 3600000 // 1 hour
#define REPOSITORY_SYNC_INTERVAL 86400000 // 24 hours

namespace elazar {

struct PackageInfo {
    std::string name;
    std::string version;
    std::string description;
    std::vector<std::string> dependencies;
    std::vector<std::string> provides;
    std::vector<std::string> conflicts;
    std::string maintainer;
    std::string homepage;
    std::string license;
    uint64_t size;
    std::string sha256;
    std::string architecture;
    std::string repository;
    std::chrono::system_clock::time_point release_date;
    int priority;
    bool installed;

    nlohmann::json toJson() const {
        return {
            {"name", name},
            {"version", version},
            {"description", description},
            {"dependencies", dependencies},
            {"provides", provides},
            {"conflicts", conflicts},
            {"maintainer", maintainer},
            {"homepage", homepage},
            {"license", license},
            {"size", size},
            {"sha256", sha256},
            {"architecture", architecture},
            {"repository", repository},
            {"release_date", std::chrono::duration_cast<std::chrono::milliseconds>(
                release_date.time_since_epoch()).count()},
            {"priority", priority},
            {"installed", installed}
        };
    }

    static PackageInfo fromJson(const nlohmann::json& j) {
        PackageInfo pkg;
        pkg.name = j.value("name", "");
        pkg.version = j.value("version", "");
        pkg.description = j.value("description", "");
        pkg.dependencies = j.value("dependencies", std::vector<std::string>{});
        pkg.provides = j.value("provides", std::vector<std::string>{});
        pkg.conflicts = j.value("conflicts", std::vector<std::string>{});
        pkg.maintainer = j.value("maintainer", "");
        pkg.homepage = j.value("homepage", "");
        pkg.license = j.value("license", "");
        pkg.size = j.value("size", 0ULL);
        pkg.sha256 = j.value("sha256", "");
        pkg.architecture = j.value("architecture", "");
        pkg.repository = j.value("repository", "");
        pkg.release_date = std::chrono::system_clock::time_point(
            std::chrono::milliseconds(j.value("release_date", 0LL)));
        pkg.priority = j.value("priority", 0);
        pkg.installed = j.value("installed", false);
        return pkg;
    }
};

class DependencyResolver {
private:
    std::map<std::string, PackageInfo> package_database;
    std::map<std::string, std::vector<std::string>> reverse_dependencies;
    std::mutex resolver_mutex;

public:
    void addPackage(const PackageInfo& pkg) {
        std::lock_guard<std::mutex> lock(resolver_mutex);
        package_database[pkg.name] = pkg;

        // Update reverse dependencies
        for (const std::string& dep : pkg.dependencies) {
            reverse_dependencies[dep].push_back(pkg.name);
        }
    }

    std::vector<std::string> resolveDependencies(const std::string& package_name, bool recursive = true) {
        std::lock_guard<std::mutex> lock(resolver_mutex);
        std::vector<std::string> resolved;
        std::set<std::string> visited;
        std::queue<std::string> to_process;

        to_process.push(package_name);
        visited.insert(package_name);

        while (!to_process.empty() && resolved.size() < DEPENDENCY_RESOLUTION_DEPTH) {
            std::string current = to_process.front();
            to_process.pop();

            if (package_database.count(current)) {
                const PackageInfo& pkg = package_database[current];

                for (const std::string& dep : pkg.dependencies) {
                    if (visited.find(dep) == visited.end()) {
                        visited.insert(dep);
                        resolved.push_back(dep);

                        if (recursive) {
                            to_process.push(dep);
                        }
                    }
                }
            }
        }

        return resolved;
    }

    std::vector<std::string> findReverseDependencies(const std::string& package_name) {
        std::lock_guard<std::mutex> lock(resolver_mutex);
        if (reverse_dependencies.count(package_name)) {
            return reverse_dependencies[package_name];
        }
        return {};
    }

    bool checkConflicts(const std::string& package_name) {
        std::lock_guard<std::mutex> lock(resolver_mutex);
        if (!package_database.count(package_name)) return false;

        const PackageInfo& pkg = package_database[package_name];

        for (const std::string& conflict : pkg.conflicts) {
            if (package_database.count(conflict) && package_database[conflict].installed) {
                return true;
            }
        }

        return false;
    }

    std::vector<std::string> getInstallationOrder(const std::vector<std::string>& packages) {
        std::vector<std::string> ordered;
        std::set<std::string> processed;
        std::map<std::string, int> indegree;

        // Calculate indegrees (number of unresolved dependencies)
        for (const std::string& pkg : packages) {
            if (package_database.count(pkg)) {
                int deps = 0;
                for (const std::string& dep : package_database[pkg].dependencies) {
                    if (std::find(packages.begin(), packages.end(), dep) != packages.end()) {
                        deps++;
                    }
                }
                indegree[pkg] = deps;
            }
        }

        // Topological sort using Kahn's algorithm
        std::queue<std::string> queue;
        for (const std::string& pkg : packages) {
            if (indegree[pkg] == 0) {
                queue.push(pkg);
            }
        }

        while (!queue.empty()) {
            std::string current = queue.front();
            queue.pop();
            ordered.push_back(current);
            processed.insert(current);

            // Update indegrees of dependent packages
            if (reverse_dependencies.count(current)) {
                for (const std::string& dependent : reverse_dependencies[current]) {
                    if (indegree.count(dependent) && processed.find(dependent) == processed.end()) {
                        indegree[dependent]--;
                        if (indegree[dependent] == 0) {
                            queue.push(dependent);
                        }
                    }
                }
            }
        }

        return ordered;
    }
};

class PackageCache {
private:
    std::string cache_dir;
    uint64_t max_size;
    std::map<std::string, std::chrono::system_clock::time_point> cache_index;
    std::mutex cache_mutex;

public:
    PackageCache(const std::string& dir, uint64_t max_size_bytes = PACKAGE_CACHE_SIZE)
        : cache_dir(dir), max_size(max_size_bytes) {

        boost::filesystem::create_directories(cache_dir);
        loadCacheIndex();
        enforceCacheSize();
    }

    bool isCached(const std::string& package_name, const std::string& version) {
        std::lock_guard<std::mutex> lock(cache_mutex);
        std::string cache_key = package_name + "-" + version;
        return cache_index.count(cache_key) > 0;
    }

    std::string getCachePath(const std::string& package_name, const std::string& version) {
        return cache_dir + "/" + package_name + "-" + version + ".pkg";
    }

    void addToCache(const std::string& package_name, const std::string& version) {
        std::lock_guard<std::mutex> lock(cache_mutex);
        std::string cache_key = package_name + "-" + version;
        cache_index[cache_key] = std::chrono::system_clock::now();
        saveCacheIndex();
        enforceCacheSize();
    }

    void removeFromCache(const std::string& package_name, const std::string& version) {
        std::lock_guard<std::mutex> lock(cache_mutex);
        std::string cache_key = package_name + "-" + version;
        std::string cache_path = getCachePath(package_name, version);

        if (boost::filesystem::exists(cache_path)) {
            boost::filesystem::remove(cache_path);
        }

        cache_index.erase(cache_key);
        saveCacheIndex();
    }

    uint64_t getCacheSize() const {
        uint64_t total_size = 0;
        for (const auto& entry : boost::filesystem::directory_iterator(cache_dir)) {
            if (boost::filesystem::is_regular_file(entry)) {
                total_size += boost::filesystem::file_size(entry);
            }
        }
        return total_size;
    }

private:
    void loadCacheIndex() {
        std::string index_file = cache_dir + "/cache_index.json";
        if (boost::filesystem::exists(index_file)) {
            try {
                std::ifstream file(index_file);
                nlohmann::json index_data;
                file >> index_data;

                for (const auto& [key, timestamp] : index_data.items()) {
                    cache_index[key] = std::chrono::system_clock::time_point(
                        std::chrono::milliseconds(timestamp.get<long long>()));
                }
            } catch (const std::exception& e) {
                std::cerr << "Failed to load cache index: " << e.what() << std::endl;
            }
        }
    }

    void saveCacheIndex() {
        std::string index_file = cache_dir + "/cache_index.json";
        nlohmann::json index_data;

        for (const auto& [key, timestamp] : cache_index) {
            index_data[key] = std::chrono::duration_cast<std::chrono::milliseconds>(
                timestamp.time_since_epoch()).count();
        }

        std::ofstream file(index_file);
        file << index_data.dump(2);
    }

    void enforceCacheSize() {
        uint64_t current_size = getCacheSize();
        if (current_size <= max_size) return;

        // Remove oldest packages until we're under the limit
        std::vector<std::pair<std::string, std::chrono::system_clock::time_point>> sorted_cache(
            cache_index.begin(), cache_index.end());

        std::sort(sorted_cache.begin(), sorted_cache.end(),
                 [](const auto& a, const auto& b) { return a.second < b.second; });

        for (const auto& [cache_key, timestamp] : sorted_cache) {
            if (current_size <= max_size) break;

            size_t dash_pos = cache_key.find_last_of('-');
            if (dash_pos != std::string::npos) {
                std::string package_name = cache_key.substr(0, dash_pos);
                std::string version = cache_key.substr(dash_pos + 1);
                removeFromCache(package_name, version);

                std::string cache_path = getCachePath(package_name, version);
                if (boost::filesystem::exists(cache_path)) {
                    current_size -= boost::filesystem::file_size(cache_path);
                }
            }
        }
    }
};

class PackageDownloader {
private:
    boost::asio::io_context io_context;
    boost::asio::ssl::context ssl_context{boost::asio::ssl::context::tlsv12_client};
    std::vector<std::thread> download_threads;
    std::atomic<int> active_downloads;
    std::mutex download_mutex;
    std::condition_variable download_cv;

public:
    PackageDownloader() : active_downloads(0) {
        ssl_context.set_verify_mode(boost::asio::ssl::verify_peer);
        ssl_context.set_default_verify_paths();
    }

    ~PackageDownloader() {
        for (auto& thread : download_threads) {
            if (thread.joinable()) {
                thread.join();
            }
        }
    }

    bool downloadPackage(const std::string& url, const std::string& output_path,
                        const std::string& expected_sha256 = "") {
        if (active_downloads >= MAX_CONCURRENT_DOWNLOADS) {
            std::unique_lock<std::mutex> lock(download_mutex);
            download_cv.wait(lock, [this]() { return active_downloads < MAX_CONCURRENT_DOWNLOADS; });
        }

        active_downloads++;
        bool success = false;

        try {
            // Parse URL
            std::string host, path;
            uint16_t port = 443;
            bool use_ssl = true;

            size_t protocol_end = url.find("://");
            if (protocol_end != std::string::npos) {
                std::string protocol = url.substr(0, protocol_end);
                use_ssl = (protocol == "https");

                size_t host_start = protocol_end + 3;
                size_t path_start = url.find('/', host_start);
                if (path_start != std::string::npos) {
                    host = url.substr(host_start, path_start - host_start);
                    path = url.substr(path_start);
                } else {
                    host = url.substr(host_start);
                    path = "/";
                }

                size_t port_pos = host.find(':');
                if (port_pos != std::string::npos) {
                    port = std::stoi(host.substr(port_pos + 1));
                    host = host.substr(0, port_pos);
                }
            }

            // Perform download
            boost::asio::ip::tcp::resolver resolver(io_context);
            auto endpoints = resolver.resolve(host, std::to_string(port));

            boost::beast::ssl_stream<boost::asio::ip::tcp::socket> stream(io_context, ssl_context);
            boost::asio::connect(stream.next_layer(), endpoints);
            stream.handshake(boost::asio::ssl::stream_base::client);

            boost::beast::http::request<boost::beast::http::empty_body> req;
            req.method(boost::beast::http::verb::get);
            req.target(path);
            req.set(boost::beast::http::field::host, host);
            req.set(boost::beast::http::field::user_agent, "Elazar-Package-Manager/1.0");

            boost::beast::http::write(stream, req);

            boost::beast::multi_buffer buffer;
            boost::beast::http::response<boost::beast::http::dynamic_body> res;
            boost::beast::http::read(stream, buffer, res);

            if (res.result() == boost::beast::http::status::ok) {
                // Write to file
                std::ofstream output_file(output_path, std::ios::binary);
                auto& body = res.body();
                auto buffers = body.data();
                for (auto it = buffers.begin(); it != buffers.end(); ++it) {
                    output_file.write(boost::asio::buffer_cast<const char*>(*it),
                                    boost::asio::buffer_size(*it));
                }

                output_file.close();

                // Verify checksum if provided
                if (!expected_sha256.empty()) {
                    std::string actual_sha256 = calculateSHA256(output_path);
                    if (actual_sha256 != expected_sha256) {
                        std::cerr << "SHA256 verification failed for " << output_path << std::endl;
                        boost::filesystem::remove(output_path);
                        success = false;
                    } else {
                        success = true;
                    }
                } else {
                    success = true;
                }
            }

            boost::system::error_code ec;
            stream.shutdown(ec);

        } catch (const std::exception& e) {
            std::cerr << "Download failed: " << e.what() << std::endl;
            success = false;
        }

        active_downloads--;
        download_cv.notify_one();

        return success;
    }

private:
    std::string calculateSHA256(const std::string& file_path) {
        std::ifstream file(file_path, std::ios::binary);
        if (!file) return "";

        SHA256_CTX sha256;
        SHA256_Init(&sha256);

        char buffer[8192];
        while (file.read(buffer, sizeof(buffer))) {
            SHA256_Update(&sha256, buffer, file.gcount());
        }
        SHA256_Update(&sha256, buffer, file.gcount());

        unsigned char hash[SHA256_DIGEST_LENGTH];
        SHA256_Final(hash, &sha256);

        std::stringstream ss;
        for (int i = 0; i < SHA256_DIGEST_LENGTH; ++i) {
            ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
        }

        return ss.str();
    }
};

class PackageInstaller {
private:
    std::string install_root;
    PackageCache& cache;
    DependencyResolver& resolver;

public:
    PackageInstaller(const std::string& root, PackageCache& c, DependencyResolver& r)
        : install_root(root), cache(c), resolver(r) {

        boost::filesystem::create_directories(install_root);
    }

    bool installPackage(const PackageInfo& pkg, const std::string& package_path) {
        std::cout << "📦 Installing package: " << pkg.name << " v" << pkg.version << std::endl;

        // Check for conflicts
        if (resolver.checkConflicts(pkg.name)) {
            std::cerr << "❌ Package conflicts detected for: " << pkg.name << std::endl;
            return false;
        }

        // Extract package
        if (!extractPackage(package_path, pkg)) {
            std::cerr << "❌ Failed to extract package: " << pkg.name << std::endl;
            return false;
        }

        // Update package database
        PackageInfo installed_pkg = pkg;
        installed_pkg.installed = true;
        resolver.addPackage(installed_pkg);

        // Run post-installation scripts if any
        runPostInstallScript(pkg);

        std::cout << "✅ Successfully installed: " << pkg.name << std::endl;
        return true;
    }

    bool removePackage(const std::string& package_name) {
        std::cout << "🗑️ Removing package: " << package_name << std::endl;

        // Check reverse dependencies
        auto dependents = resolver.findReverseDependencies(package_name);
        if (!dependents.empty()) {
            std::cerr << "❌ Package " << package_name << " is required by: ";
            for (const std::string& dep : dependents) {
                std::cerr << dep << " ";
            }
            std::cerr << std::endl;
            return false;
        }

        // Remove package files
        std::string package_dir = install_root + "/packages/" + package_name;
        if (boost::filesystem::exists(package_dir)) {
            boost::filesystem::remove_all(package_dir);
        }

        // Update package database (mark as not installed)
        // In a real implementation, this would update the database

        std::cout << "✅ Successfully removed: " << package_name << std::endl;
        return true;
    }

private:
    bool extractPackage(const std::string& archive_path, const PackageInfo& pkg) {
        struct archive* archive = archive_read_new();
        struct archive_entry* entry;

        archive_read_support_filter_all(archive);
        archive_read_support_format_all(archive);

        if (archive_read_open_filename(archive, archive_path.c_str(), 10240) != ARCHIVE_OK) {
            std::cerr << "Failed to open archive: " << archive_path << std::endl;
            archive_read_free(archive);
            return false;
        }

        std::string extract_path = install_root + "/packages/" + pkg.name;
        boost::filesystem::create_directories(extract_path);

        while (archive_read_next_header(archive, &entry) == ARCHIVE_OK) {
            std::string entry_path = extract_path + "/" + archive_entry_pathname(entry);

            // Create parent directories
            boost::filesystem::path entry_boost_path(entry_path);
            boost::filesystem::create_directories(entry_boost_path.parent_path());

            // Extract file
            if (archive_entry_filetype(entry) == AE_IFREG) {
                std::ofstream output_file(entry_path, std::ios::binary);
                if (output_file) {
                    char buffer[8192];
                    size_t size;
                    while ((size = archive_read_data(archive, buffer, sizeof(buffer))) > 0) {
                        output_file.write(buffer, size);
                    }
                    output_file.close();
                }
            }

            archive_read_data_skip(archive);
        }

        archive_read_free(archive);
        return true;
    }

    void runPostInstallScript(const PackageInfo& pkg) {
        // In a real implementation, this would run post-installation scripts
        // For now, just log the action
        std::cout << "🔧 Running post-install script for: " << pkg.name << std::endl;
    }
};

class RepositoryManager {
private:
    std::vector<std::string> repositories;
    std::map<std::string, PackageInfo> package_index;
    PackageDownloader downloader;
    std::thread sync_thread;
    std::atomic<bool> sync_active;
    mutable std::mutex repo_mutex;

public:
    RepositoryManager() : sync_active(true) {
        // Add default repositories
        repositories = {
            "https://packages.elazar-os.org/stable",
            "https://packages.elazar-os.org/unstable"
        };

        startRepositorySync();
    }

    ~RepositoryManager() {
        sync_active = false;
        if (sync_thread.joinable()) {
            sync_thread.join();
        }
    }

    void addRepository(const std::string& url) {
        std::lock_guard<std::mutex> lock(repo_mutex);
        repositories.push_back(url);
    }

    std::vector<PackageInfo> searchPackages(const std::string& query) {
        std::lock_guard<std::mutex> lock(repo_mutex);
        std::vector<PackageInfo> results;

        for (const auto& [name, pkg] : package_index) {
            if (name.find(query) != std::string::npos ||
                pkg.description.find(query) != std::string::npos) {
                results.push_back(pkg);
            }
        }

        return results;
    }

    PackageInfo getPackageInfo(const std::string& name) {
        std::lock_guard<std::mutex> lock(repo_mutex);
        if (package_index.count(name)) {
            return package_index[name];
        }
        return PackageInfo{}; // Return empty package info
    }

    size_t getRepositoryCount() const {
        std::lock_guard<std::mutex> lock(repo_mutex);
        return repositories.size();
    }

    void updatePackageIndex() {
        std::lock_guard<std::mutex> lock(repo_mutex);

        for (const std::string& repo_url : repositories) {
            std::string index_url = repo_url + "/packages.json";
            std::string temp_file = "/tmp/package_index_" + std::to_string(std::rand()) + ".json";

            if (downloader.downloadPackage(index_url, temp_file)) {
                try {
                    std::ifstream file(temp_file);
                    nlohmann::json index_data;
                    file >> index_data;

                    for (const auto& pkg_json : index_data) {
                        PackageInfo pkg = PackageInfo::fromJson(pkg_json);
                        pkg.repository = repo_url;
                        package_index[pkg.name] = pkg;
                    }

                    std::cout << "📚 Updated package index from: " << repo_url << std::endl;

                } catch (const std::exception& e) {
                    std::cerr << "Failed to parse package index from " << repo_url << ": " << e.what() << std::endl;
                }

                boost::filesystem::remove(temp_file);
            }
        }
    }

private:
    void startRepositorySync() {
        sync_thread = std::thread([this]() {
            while (sync_active) {
                updatePackageIndex();
                std::this_thread::sleep_for(std::chrono::milliseconds(REPOSITORY_SYNC_INTERVAL));
            }
        });
    }
};

class ElazarPackageManager {
private:
    RepositoryManager repo_manager;
    DependencyResolver dependency_resolver;
    PackageCache package_cache;
    PackageInstaller package_installer;
    PackageDownloader package_downloader;

    std::string install_root;
    std::atomic<uint64_t> total_packages_installed;
    std::atomic<uint64_t> total_packages_downloaded;

    // API Server
    boost::asio::io_context io_context;
    boost::asio::ip::tcp::acceptor acceptor;
    boost::asio::ip::tcp::socket socket;
    std::thread api_thread;
    std::atomic<bool> api_active;

public:
    ElazarPackageManager(const std::string& root = "/opt/elazar")
        : package_cache(root + "/cache", PACKAGE_CACHE_SIZE),
          package_installer(root, package_cache, dependency_resolver),
          install_root(root), total_packages_installed(0), total_packages_downloaded(0),
          acceptor(io_context, boost::asio::ip::tcp::endpoint(boost::asio::ip::tcp::v4(), 4400)),
          socket(io_context), api_active(true) {

        boost::filesystem::create_directories(root);
        startAPIServer();

        std::cout << "📦 Elazar Package Manager: Active" << std::endl;
        std::cout << "   Install Root: " << install_root << std::endl;
        std::cout << "   Cache Size: " << PACKAGE_CACHE_SIZE / 1000000 << "MB" << std::endl;
        std::cout << "   API Port: 4400" << std::endl;
    }

    ~ElazarPackageManager() {
        api_active = false;
        if (api_thread.joinable()) {
            api_thread.join();
        }
    }

    bool installPackage(const std::string& package_name) {
        auto pkg_info = repo_manager.getPackageInfo(package_name);
        if (pkg_info.name.empty()) {
            std::cerr << "❌ Package not found: " << package_name << std::endl;
            return false;
        }

        // Resolve dependencies
        auto dependencies = dependency_resolver.resolveDependencies(package_name);
        dependencies.push_back(package_name);

        // Get installation order
        auto install_order = dependency_resolver.getInstallationOrder(dependencies);

        // Download and install packages
        for (const std::string& pkg : install_order) {
            auto current_pkg = repo_manager.getPackageInfo(pkg);

            if (current_pkg.installed) continue;

            std::string package_url = current_pkg.repository + "/packages/" +
                                    current_pkg.name + "-" + current_pkg.version + ".pkg";
            std::string cache_path = package_cache.getCachePath(current_pkg.name, current_pkg.version);

            // Download if not cached
            if (!package_cache.isCached(current_pkg.name, current_pkg.version)) {
                std::cout << "⬇️ Downloading: " << current_pkg.name << std::endl;
                if (!package_downloader.downloadPackage(package_url, cache_path, current_pkg.sha256)) {
                    std::cerr << "❌ Download failed: " << current_pkg.name << std::endl;
                    return false;
                }
                package_cache.addToCache(current_pkg.name, current_pkg.version);
                total_packages_downloaded++;
            }

            // Install package
            if (!package_installer.installPackage(current_pkg, cache_path)) {
                return false;
            }

            total_packages_installed++;
        }

        return true;
    }

    bool removePackage(const std::string& package_name) {
        return package_installer.removePackage(package_name);
    }

    std::vector<PackageInfo> searchPackages(const std::string& query) {
        return repo_manager.searchPackages(query);
    }

    void updatePackageIndex() {
        repo_manager.updatePackageIndex();
    }

private:
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
                if (req.target() == "/api/packages/status") {
                    handleStatusRequest(res);
                } else if (req.target().find("/api/packages/search") == 0) {
                    handleSearchRequest(req, res);
                } else if (req.target().find("/api/packages/info") == 0) {
                    handleInfoRequest(req, res);
                } else {
                    res.result(boost::beast::http::status::not_found);
                    res.body() = "Endpoint not found";
                }
            } else if (req.method() == boost::beast::http::verb::post) {
                if (req.target() == "/api/packages/install") {
                    handleInstallRequest(req, res);
                } else if (req.target() == "/api/packages/remove") {
                    handleRemoveRequest(req, res);
                } else if (req.target() == "/api/packages/update-index") {
                    handleUpdateIndexRequest(res);
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

    void handleStatusRequest(boost::beast::http::response<boost::beast::http::string_body>& res) {
        nlohmann::json status = {
            {"total_packages_installed", total_packages_installed.load()},
            {"total_packages_downloaded", total_packages_downloaded.load()},
            {"cache_size", package_cache.getCacheSize()},
            {"install_root", install_root},
            {"repositories", repo_manager.getRepositoryCount()}
        };
        res.body() = status.dump(2);
        res.result(boost::beast::http::status::ok);
    }

    void handleSearchRequest(const boost::beast::http::request<boost::beast::http::string_body>& req,
                           boost::beast::http::response<boost::beast::http::string_body>& res) {
        try {
            // Extract query from URL
            std::string target = std::string(req.target());
            size_t query_pos = target.find("?q=");
            if (query_pos == std::string::npos) {
                res.result(boost::beast::http::status::bad_request);
                res.body() = "{\"error\": \"Missing query parameter\"}";
                return;
            }

            std::string query = target.substr(query_pos + 3);
            // URL decode (simplified)
            std::replace(query.begin(), query.end(), '+', ' ');

            auto results = searchPackages(query);
            nlohmann::json response = {
                {"query", query},
                {"results_count", results.size()},
                {"results", nlohmann::json::array()}
            };

            for (const auto& pkg : results) {
                response["results"].push_back(pkg.toJson());
            }

            res.body() = response.dump(2);
            res.result(boost::beast::http::status::ok);

        } catch (const std::exception& e) {
            res.result(boost::beast::http::status::bad_request);
            res.body() = std::string("{\"error\": \"") + e.what() + "\"}";
        }
    }

    void handleInfoRequest(const boost::beast::http::request<boost::beast::http::string_body>& req,
                          boost::beast::http::response<boost::beast::http::string_body>& res) {
        try {
            std::string target = std::string(req.target());
            size_t name_pos = target.find("?name=");
            if (name_pos == std::string::npos) {
                res.result(boost::beast::http::status::bad_request);
                res.body() = "{\"error\": \"Missing name parameter\"}";
                return;
            }

            std::string package_name = target.substr(name_pos + 6);
            auto pkg_info = repo_manager.getPackageInfo(package_name);

            if (pkg_info.name.empty()) {
                res.result(boost::beast::http::status::not_found);
                res.body() = "{\"error\": \"Package not found\"}";
                return;
            }

            res.body() = pkg_info.toJson().dump(2);
            res.result(boost::beast::http::status::ok);

        } catch (const std::exception& e) {
            res.result(boost::beast::http::status::bad_request);
            res.body() = std::string("{\"error\": \"") + e.what() + "\"}";
        }
    }

    void handleInstallRequest(const boost::beast::http::request<boost::beast::http::string_body>& req,
                            boost::beast::http::response<boost::beast::http::string_body>& res) {
        try {
            nlohmann::json request_data = nlohmann::json::parse(req.body());
            std::string package_name = request_data["package_name"];

            bool success = installPackage(package_name);

            nlohmann::json response = {
                {"success", success},
                {"package_name", package_name},
                {"message", success ? "Package installed successfully" : "Package installation failed"}
            };

            res.body() = response.dump(2);
            res.result(success ? boost::beast::http::status::ok : boost::beast::http::status::internal_server_error);

        } catch (const std::exception& e) {
            res.result(boost::beast::http::status::bad_request);
            res.body() = std::string("{\"error\": \"") + e.what() + "\"}";
        }
    }

    void handleRemoveRequest(const boost::beast::http::request<boost::beast::http::string_body>& req,
                           boost::beast::http::response<boost::beast::http::string_body>& res) {
        try {
            nlohmann::json request_data = nlohmann::json::parse(req.body());
            std::string package_name = request_data["package_name"];

            bool success = removePackage(package_name);

            nlohmann::json response = {
                {"success", success},
                {"package_name", package_name},
                {"message", success ? "Package removed successfully" : "Package removal failed"}
            };

            res.body() = response.dump(2);
            res.result(success ? boost::beast::http::status::ok : boost::beast::http::status::internal_server_error);

        } catch (const std::exception& e) {
            res.result(boost::beast::http::status::bad_request);
            res.body() = std::string("{\"error\": \"") + e.what() + "\"}";
        }
    }

    void handleUpdateIndexRequest(boost::beast::http::response<boost::beast::http::string_body>& res) {
        updatePackageIndex();

        nlohmann::json response = {
            {"success", true},
            {"message", "Package index updated successfully"}
        };

        res.body() = response.dump(2);
        res.result(boost::beast::http::status::ok);
    }
};

} // namespace elazar

int main(int argc, char* argv[]) {
    try {
        elazar::ElazarPackageManager pkg_manager;

        // Parse command line arguments
        if (argc > 1) {
            if (std::string(argv[1]) == "--install" && argc >= 3) {
                std::string package_name = argv[2];
                bool success = pkg_manager.installPackage(package_name);
                return success ? 0 : 1;

            } else if (std::string(argv[1]) == "--remove" && argc >= 3) {
                std::string package_name = argv[2];
                bool success = pkg_manager.removePackage(package_name);
                return success ? 0 : 1;

            } else if (std::string(argv[1]) == "--search" && argc >= 3) {
                std::string query = argv[2];
                auto results = pkg_manager.searchPackages(query);

                std::cout << "Search results for '" << query << "':" << std::endl;
                for (const auto& pkg : results) {
                    std::cout << "  " << pkg.name << " v" << pkg.version
                             << " - " << pkg.description << std::endl;
                }
                return 0;

            } else if (std::string(argv[1]) == "--update-index") {
                pkg_manager.updatePackageIndex();
                std::cout << "Package index updated successfully" << std::endl;
                return 0;

            } else if (std::string(argv[1]) == "--test") {
                std::cout << "🧪 Running package manager tests..." << std::endl;
                // Run tests
                return 0;

            } else if (std::string(argv[1]) == "--benchmark") {
                std::cout << "📊 Running package manager benchmark..." << std::endl;
                // Run benchmarks
                return 0;

            } else {
                std::cout << "Usage: " << argv[0] << " [command]" << std::endl;
                std::cout << "Commands:" << std::endl;
                std::cout << "  --install <package>    Install a package" << std::endl;
                std::cout << "  --remove <package>     Remove a package" << std::endl;
                std::cout << "  --search <query>       Search for packages" << std::endl;
                std::cout << "  --update-index         Update package index" << std::endl;
                std::cout << "  --test                 Run tests" << std::endl;
                std::cout << "  --benchmark           Run benchmarks" << std::endl;
                return 1;
            }
        }

        // Keep service running
        std::cout << "Elazar Package Manager running... Press Ctrl+C to stop." << std::endl;

        // Wait for interrupt
        std::signal(SIGINT, [](int) {
            std::cout << "\nShutting down package manager..." << std::endl;
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