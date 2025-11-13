# Fixing Code OSS build issues for Debian distributions

When trying to build Code OSS on a Debian distribution, you might get an error message like this one:
`FATAL:setuid_sandbox_host.cc(158)] The SUID sandbox helper binary was found, but is not configured correctly`

This usually happens on Debian and other distributions when the kernel has the `unprivileged_userns_clone` setting disabled. To verify that this is the issue, run the command:

```
$ sysctl kernel.unprivileged_userns_clone
kernel.unprivileged_userns_clone = 0
```

If you get a 0 for this setting, then you have two options to address this:

1. You can turn on the user namespace cloning by running:
   `sudo sysctl -w kernel.unprivileged_userns_clone=1`

2. You can disable the sandbox when you run the application with the command:
   `code-oss --no-sandbox`