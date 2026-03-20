package az.edu.itbrains.devinsight2.repository.company;

import az.edu.itbrains.devinsight2.model.company.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByDomain(String domain);
    Optional<Company> findByName(String name);
    boolean existsByDomain(String domain);
}