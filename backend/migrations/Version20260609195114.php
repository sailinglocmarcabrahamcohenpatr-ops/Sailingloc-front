<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260609195114 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE bateau (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, type VARCHAR(100) NOT NULL, localisation VARCHAR(255) NOT NULL, description CLOB DEFAULT NULL, capacite_personnes INTEGER NOT NULL, longueur_metres INTEGER NOT NULL, prix_jour_centimes INTEGER NOT NULL, disponible BOOLEAN NOT NULL, created_at DATETIME NOT NULL, proprietaire_id INTEGER NOT NULL, CONSTRAINT FK_A664B05A76C50E4A FOREIGN KEY (proprietaire_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_A664B05A76C50E4A ON bateau (proprietaire_id)');
        $this->addSql('CREATE TABLE paiement (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, stripe_payment_intent_id VARCHAR(255) DEFAULT NULL, stripe_session_id VARCHAR(255) DEFAULT NULL, montant_centimes INTEGER NOT NULL, devise VARCHAR(3) NOT NULL, statut VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, paye_at DATETIME DEFAULT NULL, reservation_id INTEGER NOT NULL, CONSTRAINT FK_B1DC7A1EB83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B1DC7A1EB83297E7 ON paiement (reservation_id)');
        $this->addSql('CREATE TABLE reservation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date_debut DATE NOT NULL, date_fin DATE NOT NULL, nombre_personnes INTEGER NOT NULL, montant_total_centimes INTEGER NOT NULL, frais_service_centimes INTEGER NOT NULL, statut VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, bateau_id INTEGER NOT NULL, locataire_id INTEGER NOT NULL, CONSTRAINT FK_42C84955A9706509 FOREIGN KEY (bateau_id) REFERENCES bateau (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_42C84955D8A38199 FOREIGN KEY (locataire_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_42C84955A9706509 ON reservation (bateau_id)');
        $this->addSql('CREATE INDEX IDX_42C84955D8A38199 ON reservation (locataire_id)');
        $this->addSql('CREATE TABLE "user" (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles CLOB NOT NULL, password VARCHAR(255) NOT NULL, prenom VARCHAR(100) NOT NULL, nom VARCHAR(100) NOT NULL, telephone VARCHAR(20) DEFAULT NULL, created_at DATETIME NOT NULL)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON "user" (email)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE bateau');
        $this->addSql('DROP TABLE paiement');
        $this->addSql('DROP TABLE reservation');
        $this->addSql('DROP TABLE "user"');
    }
}
