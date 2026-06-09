<?php

namespace App\Service;

use App\Entity\Reservation;
use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

class EmailService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire('%env(MAILER_FROM_ADDRESS)%')]
        private readonly string $fromAddress,
        #[Autowire('%env(MAILER_FROM_NAME)%')]
        private readonly string $fromName,
    ) {}

    /**
     * Envoie la confirmation de réservation au locataire.
     */
    public function envoyerConfirmationReservation(Reservation $reservation): void
    {
        $locataire = $reservation->getLocataire();

        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($locataire->getEmail(), $locataire->getNomComplet()))
            ->subject('Confirmation de votre réservation — SailingLoc')
            ->htmlTemplate('emails/confirmation_reservation.html.twig')
            ->context([
                'reservation' => $reservation,
                'locataire'   => $locataire,
                'bateau'      => $reservation->getBateau(),
            ]);

        $this->mailer->send($email);
    }

    /**
     * Envoie le récapitulatif de paiement après que le paiement est confirmé.
     */
    public function envoyerRecapitulatifPaiement(Reservation $reservation): void
    {
        $locataire = $reservation->getLocataire();

        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($locataire->getEmail(), $locataire->getNomComplet()))
            ->subject('Récapitulatif de votre paiement — SailingLoc')
            ->htmlTemplate('emails/recapitulatif_paiement.html.twig')
            ->context([
                'reservation' => $reservation,
                'locataire'   => $locataire,
                'bateau'      => $reservation->getBateau(),
                'paiement'    => $reservation->getPaiement(),
            ]);

        $this->mailer->send($email);
    }

    /**
     * Notifie le propriétaire du bateau d'une nouvelle réservation.
     */
    public function notifierProprietaire(Reservation $reservation): void
    {
        $proprietaire = $reservation->getBateau()->getProprietaire();

        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($proprietaire->getEmail(), $proprietaire->getNomComplet()))
            ->subject('Nouvelle réservation pour votre bateau — SailingLoc')
            ->htmlTemplate('emails/notification_proprietaire.html.twig')
            ->context([
                'reservation'  => $reservation,
                'proprietaire' => $proprietaire,
                'locataire'    => $reservation->getLocataire(),
                'bateau'       => $reservation->getBateau(),
            ]);

        $this->mailer->send($email);
    }

    /**
     * Envoie une notification d'annulation au locataire.
     */
    public function envoyerNotificationAnnulation(Reservation $reservation, User $destinataire): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($destinataire->getEmail(), $destinataire->getNomComplet()))
            ->subject('Annulation de réservation — SailingLoc')
            ->htmlTemplate('emails/annulation_reservation.html.twig')
            ->context([
                'reservation' => $reservation,
                'destinataire' => $destinataire,
                'bateau'      => $reservation->getBateau(),
            ]);

        $this->mailer->send($email);
    }
}
