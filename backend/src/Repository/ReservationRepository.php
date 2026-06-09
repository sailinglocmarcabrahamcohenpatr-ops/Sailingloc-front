<?php

namespace App\Repository;

use App\Entity\Reservation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    /** Vérifie si un bateau est déjà réservé sur une période donnée */
    public function isBateauDisponible(int $bateauId, \DateTimeInterface $debut, \DateTimeInterface $fin, ?int $excludeReservationId = null): bool
    {
        $qb = $this->createQueryBuilder('r')
            ->andWhere('r.bateau = :bateauId')
            ->andWhere('r.statut != :annulee')
            ->andWhere('r.dateDebut < :fin')
            ->andWhere('r.dateFin > :debut')
            ->setParameter('bateauId', $bateauId)
            ->setParameter('annulee', Reservation::STATUT_ANNULEE)
            ->setParameter('debut', $debut)
            ->setParameter('fin', $fin);

        if ($excludeReservationId !== null) {
            $qb->andWhere('r.id != :exclude')->setParameter('exclude', $excludeReservationId);
        }

        return $qb->getQuery()->getOneOrNullResult() === null;
    }
}
