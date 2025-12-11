CREATE USER gym_reception IDENTIFIED BY reception123;
CREATE USER gym_manager IDENTIFIED BY manager123;
CREATE USER admin IDENTIFIED BY admin123;

GRANT CREATE SESSION TO gym_admin, gym_reception, gym_manager;
GRANT UNLIMITED TABLESPACE TO gym_admin;
GRANT SELECT, INSERT, UPDATE ON member TO gym_reception;
GRANT SELECT, INSERT ON payments TO gym_reception;
GRANT SELECT ON membership TO gym_reception;
GRANT SELECT ON v_active_members TO gym_reception;
GRANT EXECUTE ON pkg_gym_management TO gym_reception;