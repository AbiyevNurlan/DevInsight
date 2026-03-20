package az.edu.itbrains.devinsight2.config;

/**
 * Tenant context holder for multi-tenant isolation
 * Used to store the current company ID for database filtering
 */
public class TenantContext {
    
    private static final ThreadLocal<Long> currentTenant = new ThreadLocal<>();
    
    public static void setCurrentTenant(Long tenantId) {
        // Allow null for users without company (e.g., candidates, test users)
        currentTenant.set(tenantId);
    }
    
    public static Long getCurrentTenant() {
        return currentTenant.get();
    }
    
    public static Long getCurrentTenantOrDefault(Long defaultValue) {
        Long tenant = currentTenant.get();
        return tenant != null ? tenant : defaultValue;
    }
    
    public static void clear() {
        currentTenant.remove();
    }
    
    public static boolean isSet() {
        return currentTenant.get() != null;
    }
}
