package az.edu.itbrains.devinsight2.model.core;

import az.edu.itbrains.devinsight2.config.TenantContext;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@MappedSuperclass
@Data
public abstract class BaseEntity {
    
    @Column(nullable = false, updatable = false)
    protected Long companyId;
    
    @CreationTimestamp
    protected LocalDateTime createdAt;
    
    @UpdateTimestamp
    protected LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        if (this.companyId == null) {
            // Get from TenantContext
            Long tenantId = TenantContext.getCurrentTenant();
            if (tenantId != null) {
                this.companyId = tenantId;
            } else {
                // Fallback to default company for development/testing
                this.companyId = 1L;
            }
        }
    }
}
